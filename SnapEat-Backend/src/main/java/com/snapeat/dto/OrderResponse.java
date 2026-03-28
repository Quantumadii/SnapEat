package com.snapeat.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.snapeat.enums.OrderStatus;
import com.snapeat.enums.PaymentMethod;
import com.snapeat.enums.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

	private Long id;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private Long restaurantId;
    private String restaurantName;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private String flatNo;
    private String deliveryArea;
    private String deliveryCity;
    private String pincode;
    private String deliveryAddress;
    private String specialInstructions;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String stripePaymentIntentId; 
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemResponse> orderItems;
}
