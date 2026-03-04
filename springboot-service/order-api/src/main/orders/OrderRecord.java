package com.sarapseoul.order_api.orders;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.*;

@DynamoDbBean
public class OrderRecord {
    private String orderId;
    private String status;
    private String createdAt;
    private String requestJson;

    private String computedSubtotal; // store as string for simplicity
    private String computedItemsJson; // store JSON string
    private String errorMessage;

    @DynamoDbPartitionKey
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getRequestJson() { return requestJson; }
    public void setRequestJson(String requestJson) { this.requestJson = requestJson; }

    public String getComputedSubtotal() { return computedSubtotal; }
    public void setComputedSubtotal(String computedSubtotal) { this.computedSubtotal = computedSubtotal; }

    public String getComputedItemsJson() { return computedItemsJson; }
    public void setComputedItemsJson(String computedItemsJson) { this.computedItemsJson = computedItemsJson; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}