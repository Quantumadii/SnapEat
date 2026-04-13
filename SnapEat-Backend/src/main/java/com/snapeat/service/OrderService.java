package com.snapeat.service;

import org.springframework.data.domain.Pageable;

import com.snapeat.dto.DashboardStats;
import com.snapeat.dto.OrderResponse;
import com.snapeat.dto.PaginatedResponse;
import com.snapeat.dto.PlaceOrderRequest;
import com.snapeat.enums.OrderStatus;

public interface OrderService {

	OrderResponse placeOrder(String email, PlaceOrderRequest req);

	

	OrderResponse getById(Long id);

	PaginatedResponse<OrderResponse> getRestaurantOrders(Long restaurantId, int page, int size);

	PaginatedResponse<OrderResponse> getRestaurantOrdersByStatus(Long restaurantId, OrderStatus status, int page, int size);

	OrderResponse updateStatus(Long orderId, OrderStatus newStatus);

	OrderResponse cancelOrder(Long orderId);

	DashboardStats getDashboard(Long restaurantId);

	PaginatedResponse<OrderResponse> getMyOrders(String email, int page, int size, String sortBy);

}