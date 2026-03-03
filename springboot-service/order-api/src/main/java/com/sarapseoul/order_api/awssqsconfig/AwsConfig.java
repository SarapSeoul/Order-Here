package com.sarapseoul.order_api.awssqsconfig;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sqs.SqsClient;

@Configuration
public class AwsConfig {

    @Bean
    public SqsClient sqsClient(@Value("${aws.region}") String region) {
        // Uses DefaultCredentialsProvider automatically:
        // - Local dev: ~/.aws/credentials (from aws configure)
        return SqsClient.builder()
                .region(Region.of(region))
                .build();
    }
}