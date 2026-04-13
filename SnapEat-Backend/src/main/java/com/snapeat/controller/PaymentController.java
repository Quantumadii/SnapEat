package com.snapeat.controller;

import com.snapeat.dto.ApiResponse;
import com.snapeat.dto.CreateCheckoutSessionRequest;
import com.snapeat.dto.CreatePaymentIntentRequest;
import com.snapeat.dto.PaymentIntentResponse;
import com.snapeat.service.PaymentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/config")
    public ResponseEntity<ApiResponse> getConfig() {
        return ResponseEntity.ok(ApiResponse.ok("Stripe config", paymentService.getPublicConfig()));
    }

    @PostMapping("/create-intent")
    public ResponseEntity<ApiResponse> createPaymentIntent(
            @Valid @RequestBody CreatePaymentIntentRequest request) {
        PaymentIntentResponse data = paymentService.createPaymentIntent(request);
        return ResponseEntity.ok(ApiResponse.ok("Payment intent created", data));
    }

    @PostMapping("/create-checkout-session")
    public ResponseEntity<ApiResponse> createCheckoutSession(
            @Valid @RequestBody CreateCheckoutSessionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Checkout session created",
                paymentService.createCheckoutSession(request)));
    }

    @PostMapping("/verify-session/{sessionId}")
    public ResponseEntity<ApiResponse> verifyCheckoutSession(@PathVariable String sessionId) {
        paymentService.verifyCheckoutSession(sessionId);
        return ResponseEntity.ok(ApiResponse.ok("Checkout session verified"));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        paymentService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok().build();
    }
}
