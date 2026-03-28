package com.snapeat.service;

import java.util.HashMap;
import java.util.Map;
import java.math.BigDecimal;

import com.snapeat.config.StripeProperties;
import com.snapeat.dto.CreateCheckoutSessionRequest;
import com.snapeat.dto.CreatePaymentIntentRequest;
import com.snapeat.dto.PaymentIntentResponse;
import com.snapeat.entity.Order;
import com.snapeat.enums.PaymentStatus;
import com.snapeat.exception.PaymentException;
import com.snapeat.exception.ResourceNotFoundException;
import com.snapeat.repository.OrderRepository;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.param.PaymentIntentCreateParams;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final StripeProperties stripeProperties;
    private final OrderRepository orderRepository;

    @Override
    public PaymentIntentResponse createPaymentIntent(CreatePaymentIntentRequest request) {
        validateStripeConfiguration();
        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(request.getAmountInPaise())
                    .setCurrency(stripeProperties.getCurrency())
                    .setDescription(request.getDescription() != null
                            ? request.getDescription()
                            : "SnapEat Order")
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build())
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            log.info("Stripe PaymentIntent created: id={}, amount={} {}",
                    intent.getId(), intent.getAmount(), intent.getCurrency());

            return PaymentIntentResponse.builder()
                    .paymentIntentId(intent.getId())
                    .clientSecret(intent.getClientSecret())
                    .amount(intent.getAmount())
                    .currency(intent.getCurrency())
                    .build();

        } catch (StripeException e) {
            log.error("Failed to create Stripe PaymentIntent: {}", e.getMessage());
            throw new PaymentException("Payment initialisation failed: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getPublicConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("publishableKey", stripeProperties.getPublishableKey());
        config.put("currency", stripeProperties.getCurrency());
        return config;
    }

    @Override
    public Map<String, Object> createCheckoutSession(CreateCheckoutSessionRequest request) {
        validateStripeConfiguration();
        if (request.getSuccessUrl() == null || request.getSuccessUrl().isBlank()) {
            throw new PaymentException("Success URL is required for Stripe checkout");
        }
        if (request.getCancelUrl() == null || request.getCancelUrl().isBlank()) {
            throw new PaymentException("Cancel URL is required for Stripe checkout");
        }

        Order order = orderRepository.findByIdWithUser(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", request.getOrderId()));

        long amountInPaise = request.getAmountInPaise() != null && request.getAmountInPaise() > 0
            ? request.getAmountInPaise()
            : resolveAmountFromOrder(order.getTotalAmount());
        String currency = stripeProperties.getCurrency() != null && !stripeProperties.getCurrency().isBlank()
            ? stripeProperties.getCurrency()
            : "inr";

        try {
            log.info("Creating Stripe checkout session for orderId={}, amountInPaise={}", order.getId(), amountInPaise);
            SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(request.getSuccessUrl())
                    .setCancelUrl(request.getCancelUrl())
                    .setClientReferenceId(order.getId().toString())
                    .putMetadata("orderId", order.getId().toString())
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                        .setCurrency(currency)
                                        .setUnitAmount(amountInPaise)
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName(request.getDescription() != null
                                                    ? request.getDescription()
                                                    : "SnapEat order #" + order.getId())
                                            .build())
                                    .build())
                            .build())
                ;

            if (order.getUser() != null && order.getUser().getEmail() != null && !order.getUser().getEmail().isBlank()) {
            paramsBuilder.setCustomerEmail(order.getUser().getEmail());
            }

            SessionCreateParams params = paramsBuilder.build();

            Session session = Session.create(params);
            if (session.getUrl() == null || session.getUrl().isBlank()) {
            throw new PaymentException("Stripe did not return a checkout URL");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("sessionId", session.getId());
            response.put("checkoutUrl", session.getUrl());
            return response;
        } catch (StripeException e) {
            log.error("Failed to create Stripe Checkout Session: {}", e.getMessage());
            throw new PaymentException("Checkout session creation failed: " + e.getMessage());
        } catch (RuntimeException e) {
            String message = e.getMessage() != null
                    ? e.getMessage()
                    : (e.getClass().getSimpleName() + " occurred during checkout creation");
            log.error("Unexpected runtime error while creating checkout session", e);
            throw new PaymentException("Checkout session creation failed: " + message, e);
        }
    }

    @Override
    public void verifyCheckoutSession(String sessionId) {
        validateStripeConfiguration();
        try {
            Session session = Session.retrieve(sessionId);
            if (!"paid".equalsIgnoreCase(session.getPaymentStatus())) {
                throw new PaymentException("Checkout session is not paid yet");
            }

            String orderIdText = session.getMetadata() != null
                    ? session.getMetadata().get("orderId")
                    : null;

            if (orderIdText == null || orderIdText.isBlank()) {
                orderIdText = session.getClientReferenceId();
            }

            if (orderIdText == null || orderIdText.isBlank()) {
                throw new PaymentException("Could not map checkout session to an order");
            }

            Long orderId = Long.valueOf(orderIdText);
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

            order.setPaymentStatus(PaymentStatus.PAID);
            if (session.getPaymentIntent() != null) {
                order.setStripePaymentIntentId(session.getPaymentIntent());
            }
            orderRepository.save(order);

            log.info("Checkout session verified and order marked paid: sessionId={}, orderId={}",
                    sessionId, orderId);
        } catch (StripeException e) {
            log.error("Failed to verify Stripe Checkout Session: {}", e.getMessage());
            throw new PaymentException("Checkout verification failed: " + e.getMessage());
        }
    }

    @Override
    public void handleWebhook(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, stripeProperties.getWebhookSecret());
        } catch (SignatureVerificationException e) {
            log.warn("Invalid Stripe webhook signature: {}", e.getMessage());
            throw new PaymentException("Invalid webhook signature");
        }

        log.info("Received Stripe webhook event: type={}, id={}", event.getType(), event.getId());

        switch (event.getType()) {

            case "payment_intent.succeeded" -> {
                String intentId = extractPaymentIntentId(event);
                updateOrderPaymentStatus(intentId, PaymentStatus.PAID);
            }

            case "payment_intent.payment_failed" -> {
                String intentId = extractPaymentIntentId(event);
                updateOrderPaymentStatus(intentId, PaymentStatus.FAILED);
            }

            default -> log.debug("Unhandled Stripe event type: {}", event.getType());
        }
    }

    private String extractPaymentIntentId(Event event) {
        return event.getDataObjectDeserializer()
                .getObject()
                .map(obj -> ((PaymentIntent) obj).getId())
                .orElseThrow(() -> new PaymentException("Could not deserialize PaymentIntent from event"));
    }

    private void updateOrderPaymentStatus(String paymentIntentId, PaymentStatus newStatus) {
        orderRepository.findByStripePaymentIntentId(paymentIntentId).ifPresentOrElse(
                order -> {
                    order.setPaymentStatus(newStatus);
                    orderRepository.save(order);
                    log.info("Order {} payment status updated to {} (intentId={})",
                            order.getId(), newStatus, paymentIntentId);
                },
                () -> log.warn("No order found for Stripe PaymentIntent: {}", paymentIntentId)
        );
    }

    private long resolveAmountFromOrder(BigDecimal totalAmount) {
        if (totalAmount == null) {
            throw new PaymentException("Order amount is missing and checkout amount was not provided");
        }
        return totalAmount.multiply(BigDecimal.valueOf(100)).longValue();
    }

    private void validateStripeConfiguration() {
        if (isMissingOrPlaceholder(stripeProperties.getSecretKey())) {
            throw new PaymentException("Stripe is not configured. Set stripe.secret-key or STRIPE_SECRET_KEY.");
        }
        if (isMissingOrPlaceholder(stripeProperties.getPublishableKey())) {
            throw new PaymentException("Stripe is not configured. Set stripe.publishable-key or STRIPE_PUBLISHABLE_KEY.");
        }
    }

    private boolean isMissingOrPlaceholder(String value) {
        return value == null || value.isBlank() || value.contains("YOUR_");
    }
}
