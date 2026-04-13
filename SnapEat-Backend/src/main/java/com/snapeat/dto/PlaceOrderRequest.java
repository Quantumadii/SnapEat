package com.snapeat.dto;

import java.util.List;

import com.snapeat.enums.PaymentMethod;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceOrderRequest {
	
	@NotNull(message = "Restaurant ID is required")
    private Long restaurantId;

    private Long branchId;

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<OrderItemRequest> items;

    @NotBlank(message = "Flat / House number is required")
    private String flatNo;

    @NotBlank(message = "Delivery area is required")
    private String deliveryArea;

    @NotBlank(message = "Delivery city is required")
    private String deliveryCity;

    @NotBlank(message = "Pincode is required")
    private String pincode;

    private String specialInstructions;
    private PaymentMethod paymentMethod = PaymentMethod.COD;
}
