package com.sarapseoul.order_api.awsAPI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;

@Service
public class OrderQueuePublisher {

    private final SqsClient sqs;
    private final String queueUrl;

    public OrderQueuePublisher(
            SqsClient sqs,
            @Value("${aws.sqs.orderCreatedQueueUrl}") String queueUrl
    ) {
        this.sqs = sqs;
        this.queueUrl = queueUrl;
    }

    public void publishOrderCreated(String orderId) {
        String body = String.format("{\"type\":\"OrderCreated\",\"orderId\":\"%s\"}", orderId);

        sqs.sendMessage(SendMessageRequest.builder()
                .queueUrl(queueUrl)
                .messageBody(body)
                .build());
    }
}