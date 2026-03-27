package com.snapeat.service;

import java.util.List;

import com.snapeat.dto.DashboardStats;
import com.snapeat.dto.OrderResponse;
import com.snapeat.dto.PlaceOrderRequest;
import com.snapeat.enums.OrderStatus;

public interface OrderService {

	OrderResponse placeOrder(String email, PlaceOrderRequest req);

	List<OrderResponse> getMyOrders(String email);

	OrderResponse getById(Long id);

	List<OrderResponse> getRestaurantOrders(Long restaurantId);

	List<OrderResponse> getRestaurantOrdersByStatus(Long restaurantId, OrderStatus status);

	OrderResponse updateStatus(Long orderId, OrderStatus newStatus);

	OrderResponse cancelOrder(Long orderId);

	DashboardStats getDashboard(Long restaurantId);

}