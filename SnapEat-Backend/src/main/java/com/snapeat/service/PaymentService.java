package com.snapeat.service;

import java.util.Map;

import com.snapeat.dto.CreateCheckoutSessionRequest;
import com.snapeat.dto.CreatePaymentIntentRequest;
import com.snapeat.dto.PaymentIntentResponse;

public interface PaymentService {

    PaymentIntentResponse createPaymentIntent(CreatePaymentIntentRequest request);

    Map<String, Object> getPublicConfig();

    Map<String, Object> createCheckoutSession(CreateCheckoutSessionRequest request);

    void verifyCheckoutSession(String sessionId);

    void handleWebhook(String payload, String sigHeader);
}
