package com.snapeat.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.snapeat.dto.ApiResponse;
import com.snapeat.dto.OrderResponse;
import com.snapeat.dto.PlaceOrderRequest;
import com.snapeat.service.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
	 private final OrderService orderService;

	    @PostMapping
	    public ResponseEntity<ApiResponse> placeOrder(
	            @AuthenticationPrincipal UserDetails userDetails,
	            @Valid @RequestBody PlaceOrderRequest req) {
	        OrderResponse data = orderService.placeOrder(userDetails.getUsername(), req);
	        return ResponseEntity.ok(ApiResponse.ok("Order placed successfully!", data));
	    }

	    @GetMapping("/my")
	    public ResponseEntity<ApiResponse> getMyOrders(
	            @AuthenticationPrincipal UserDetails userDetails) {
	        List<OrderResponse> data = orderService.getMyOrders(userDetails.getUsername());
	        return ResponseEntity.ok(ApiResponse.ok("Success", data));
	    }

	    @GetMapping("/{id}")
	    public ResponseEntity<ApiResponse> getOrderById(@PathVariable Long id) {
	        OrderResponse data = orderService.getById(id);
	        return ResponseEntity.ok(ApiResponse.ok("Success", data));
	    }

	    @PostMapping("/{id}/cancel")
	    public ResponseEntity<ApiResponse> cancelOrder(@PathVariable Long id) {
	        OrderResponse data = orderService.cancelOrder(id);
	        return ResponseEntity.ok(ApiResponse.ok("Order cancelled successfully", data));
	    }
}
