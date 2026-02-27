package com.sarapseoul.order_api.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    // ----------------------------
    // Step 3: Backend "source of truth" catalog
    // ----------------------------
    private static final Map<String, CatalogItem> CATALOG = buildCatalog();

    private static Map<String, CatalogItem> buildCatalog() {
        Map<String, CatalogItem> m = new HashMap<>();

        // Helper: base price, optional variants map (key -> multiplier)
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
                // slice = 1x, whole = 4x (matches your frontend)
                Map.of("slice", bd("1.0"), "whole", bd("4.0"))
        ));

        // NOTE: Your frontend base price here is 7
        // variants: medium=32, large=140 (by multiplier relative to 7)
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
    // API: POST /api/orders
    // ----------------------------
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(@Valid @RequestBody OrderRequest req) {

        // Compute totals server-side
        List<ComputedLineItem> computedItems = new ArrayList<>();
        BigDecimal computedSubtotal = bd("0.00");

        for (OrderItemRequest it : req.items()) {
            CatalogItem catalogItem = CATALOG.get(it.id());
            if (catalogItem == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Unknown item id: " + it.id());
            }

            BigDecimal multiplier = bd("1.0");
            if (it.variant() != null && !it.variant().isBlank()) {
                BigDecimal m = catalogItem.variantMultipliers().get(it.variant());
                if (m == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Invalid variant '" + it.variant() + "' for item: " + it.id());
                }
                multiplier = m;
            }

            BigDecimal unitPrice = catalogItem.basePrice().multiply(multiplier);
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(it.qty()));

            unitPrice = unitPrice.setScale(2, RoundingMode.HALF_UP);
            lineTotal = lineTotal.setScale(2, RoundingMode.HALF_UP);

            computedSubtotal = computedSubtotal.add(lineTotal);

            computedItems.add(new ComputedLineItem(
                    it.id(),
                    catalogItem.name(),
                    it.variant(),
                    it.qty(),
                    unitPrice,
                    lineTotal
            ));
        }

        computedSubtotal = computedSubtotal.setScale(2, RoundingMode.HALF_UP);

        // NOTE: We are intentionally NOT trusting req.subtotal / req.items[].total / req.items[].unitPrice

        return new OrderResponse(
                UUID.randomUUID().toString(),
                "RECEIVED",
                computedSubtotal,
                computedItems
        );
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
            // client subtotal can be present, but we ignore it
            BigDecimal subtotal
    ) {}

    public record OrderItemRequest(
            @NotBlank String id,
            @Positive int qty,
            // New recommended field from frontend
            String variant,
            // these may come from client but are ignored
            BigDecimal unitPrice,
            BigDecimal total,
            String name
    ) {}

    public record OrderResponse(
            String orderId,
            String status,
            BigDecimal computedSubtotal,
            List<ComputedLineItem> computedItems
    ) {}

    public record ComputedLineItem(
            String id,
            String name,
            String variant,
            int qty,
            BigDecimal computedUnitPrice,
            BigDecimal computedLineTotal
    ) {}

    private record CatalogItem(
            String name,
            BigDecimal basePrice,
            Map<String, BigDecimal> variantMultipliers
    ) {}
}