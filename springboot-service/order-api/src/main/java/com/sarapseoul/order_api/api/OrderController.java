package com.sarapseoul.order_api.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sarapseoul.order_api.awsAPI.OrderQueuePublisher;
import com.sarapseoul.order_api.orders.OrderRecord; //had to move this into java subfile
import com.sarapseoul.order_api.orders.OrderRepository; // had to move this into java subfile
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderQueuePublisher publisher;
    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;

    public OrderController(OrderQueuePublisher publisher,
                           OrderRepository orderRepository,
                           ObjectMapper objectMapper) {
        this.publisher = publisher;
        this.orderRepository = orderRepository;
        this.objectMapper = objectMapper;
    }

    // ----------------------------
    // Backend "source of truth" catalog (kept here for now)
    // ----------------------------
    private static final Map<String, CatalogItem> CATALOG = buildCatalog();

    private static Map<String, CatalogItem> buildCatalog() {
        Map<String, CatalogItem> m = new HashMap<>();

        m.put("bbqplate", new CatalogItem("K-Style Filipino Pork BBQ Plate",
                bd("10.00"),
                Map.of("pork", bd("1.0"), "chicken", bd("1.0"))
        ));

        m.put("siopao4", new CatalogItem("Kimchi Pork Asado Siopao (4ct)", bd("8.00"), Map.of()));
        m.put("rangoons6", new CatalogItem("Stuffed Crab Rangoons (6ct)", bd("8.00"), Map.of()));
        m.put("lumpia6", new CatalogItem("Crispy Lumpia (6ct)", bd("8.00"), Map.of()));

        m.put("turon4", new CatalogItem("Golden Turon (4ct)", bd("6.00"), Map.of()));
        m.put("sago", new CatalogItem("Mango Mahal Sago", bd("5.00"), Map.of()));

        m.put("flan", new CatalogItem("Caramel Silk Leche Flan",
                bd("5.00"),
                Map.of("slice", bd("1.0"), "whole", bd("4.0"))
        ));

        m.put("gochu-bistek", new CatalogItem("Gochu-Bistek",
                bd("7.00"),
                Map.of(
                        "small", bd("1.0"),
                        "medium", bd("32.00").divide(bd("7.00"), 10, RoundingMode.HALF_UP),
                        "large", bd("140.00").divide(bd("7.00"), 10, RoundingMode.HALF_UP)
                )
        ));

        m.put("bundle-kapamilya", new CatalogItem("Kapamilya ShareBox",
                bd("30.00"),
                Map.of("pork", bd("1.0"), "chicken", bd("1.0"))
        ));

        m.put("bundle-kilig", new CatalogItem("Kilig ShareBox",
                bd("18.00"),
                Map.of("pork", bd("1.0"), "chicken", bd("1.0"))
        ));

        m.put("party-lumpia-30", new CatalogItem("Lumpia Party Tray (30 pcs)", bd("40.00"), Map.of()));
        m.put("party-lumpia-60", new CatalogItem("Lumpia Party Tray (60 pcs)", bd("70.00"), Map.of()));
        m.put("party-rangoon-30", new CatalogItem("Crab Rangoon Party Tray (30 pcs)", bd("40.00"), Map.of()));
        m.put("party-rangoon-60", new CatalogItem("Crab Rangoon Party Tray (60 pcs)", bd("70.00"), Map.of()));
        m.put("party-siopao-12", new CatalogItem("Siopao Tray (12 pcs)", bd("22.00"), Map.of()));
        m.put("party-siopao-24", new CatalogItem("Siopao Tray (24 pcs)", bd("40.00"), Map.of()));
        m.put("party-bbq-15", new CatalogItem("Pork BBQ Skewer Tray (15 skewers)", bd("40.00"), Map.of()));

        return Collections.unmodifiableMap(m);
    }

    private static BigDecimal bd(String v) { return new BigDecimal(v); }

    // ----------------------------
    // POST /api/orders
    // Fast path: validate -> persist RECEIVED -> publish -> return
    // ----------------------------
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(@Valid @RequestBody OrderRequest req) {

        // Optional: lightweight validation of item IDs so we fail fast before persisting
        for (OrderItemRequest it : req.items()) {
            if (!CATALOG.containsKey(it.id())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown item id: " + it.id());
            }
            if (it.variant() != null && !it.variant().isBlank()) {
                CatalogItem ci = CATALOG.get(it.id());
                if (!ci.variantMultipliers().containsKey(it.variant())) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Invalid variant '" + it.variant() + "' for item: " + it.id()
                    );
                }
            }
        }

        String orderId = UUID.randomUUID().toString();

        // Persist OrderReceived to DynamoDB FIRST
        OrderRecord rec = new OrderRecord();
        rec.setOrderId(orderId);
        rec.setStatus("RECEIVED");
        rec.setCreatedAt(Instant.now().toString());

        try {
            rec.setRequestJson(objectMapper.writeValueAsString(req));
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to serialize request");
        }

        orderRepository.put(rec);

        // Then publish to SQS
        publisher.publishOrderCreated(orderId);

        return new OrderResponse(orderId, "RECEIVED");
    }

    // ----------------------------
    // GET /api/orders/{orderId}
    // Lets you verify async status changes easily
    // ----------------------------
    @GetMapping("/{orderId}")
    public OrderRecord getOrder(@PathVariable String orderId) {
        OrderRecord rec = orderRepository.get(orderId);
        if (rec == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + orderId);
        }
        return rec;
    }

    // ----------------------------
    // DTOs (request/response)
    // ----------------------------
    public record OrderRequest(
            @NotBlank String name,
            @NotBlank String contactMethod,
            String instagram,
            String phone,
            @NotBlank String fulfillment,
            @NotBlank String address,
            @NotBlank String paymentMethod,
            String allergies,
            @NotEmpty @Valid List<OrderItemRequest> items,
            BigDecimal subtotal
    ) {}

    public record OrderItemRequest(
            @NotBlank String id,
            @Positive int qty,
            String variant,
            BigDecimal unitPrice,
            BigDecimal total,
            String name
    ) {}

    public record OrderResponse(String orderId, String status) {}

    private record CatalogItem(
            String name,
            BigDecimal basePrice,
            Map<String, BigDecimal> variantMultipliers
    ) {}
}