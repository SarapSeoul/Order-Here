package com.sarapseoul.order_api.orders;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.*;
import software.amazon.awssdk.enhanced.dynamodb.model.GetItemEnhancedRequest;

@Repository
public class OrderRepository {

    private final DynamoDbTable<OrderRecord> table;

    public OrderRepository(DynamoDbEnhancedClient enhanced,
                           @Value("${aws.dynamodb.ordersTable}") String tableName) {
        this.table = enhanced.table(tableName, TableSchema.fromBean(OrderRecord.class));
    }

    public void put(OrderRecord record) {
        table.putItem(record);
    }

    public OrderRecord get(String orderId) {
        return table.getItem(r -> r.key(k -> k.partitionValue(orderId)));
    }

    public void update(OrderRecord record) {
        table.updateItem(record);
    }
}