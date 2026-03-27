package com.snapeat.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.snapeat.dto.ApiResponse;
import com.snapeat.dto.DashboardStats;
import com.snapeat.dto.MenuItemRequest;
import com.snapeat.dto.MenuItemResponse;
import com.snapeat.dto.OrderResponse;
import com.snapeat.dto.RestaurantRequest;
import com.snapeat.dto.RestaurantResponse;
import com.snapeat.dto.UpdateOrderStatusRequest;
import com.snapeat.enums.OrderStatus;
import com.snapeat.service.MenuService;
import com.snapeat.service.OrderService;
import com.snapeat.service.RestaurantService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
	
	private final RestaurantService restaurantService;
    private final MenuService menuService;
    private final OrderService orderService;

    @GetMapping("/restaurant/{id}")
    public ResponseEntity<ApiResponse> getRestaurant(@PathVariable Long id) {
        RestaurantResponse data = restaurantService.getById(id);
        return ResponseEntity.ok(ApiResponse.ok("Success", data));
    }

    @PutMapping(value = "/restaurant/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse> updateRestaurant(
            @PathVariable Long id,
            @Valid @ModelAttribute RestaurantRequest req) {
        RestaurantResponse data = restaurantService.update(id, req);
        return ResponseEntity.ok(ApiResponse.ok("Restaurant updated successfully", data));
    }

    @GetMapping("/menu/{restaurantId}")
    public ResponseEntity<ApiResponse> getAllMenuItems(
            @PathVariable Long restaurantId) {
        List<MenuItemResponse> data = menuService.getAdminMenu(restaurantId);
        return ResponseEntity.ok(ApiResponse.ok("Success", data));
    }

        @PostMapping(value = "/menu/{restaurantId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse> createMenuItem(
            @PathVariable Long restaurantId,
            @Valid @ModelAttribute MenuItemRequest req) {
        MenuItemResponse data = menuService.createItem(restaurantId, req);
        return ResponseEntity.ok(ApiResponse.ok("Menu item created", data));
    }

        @PutMapping(value = "/menu/item/{itemId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse> updateMenuItem(
            @PathVariable Long itemId,
            @Valid @ModelAttribute MenuItemRequest req) {
        MenuItemResponse data = menuService.updateItem(itemId, req);
        return ResponseEntity.ok(ApiResponse.ok("Menu item updated", data));
    }

    @DeleteMapping("/menu/item/{itemId}")
    public ResponseEntity<ApiResponse> deleteMenuItem(@PathVariable Long itemId) {
        menuService.deleteItem(itemId);
        return ResponseEntity.ok(ApiResponse.ok("Menu item removed"));
    }

    @PatchMapping("/menu/item/{itemId}/toggle")
    public ResponseEntity<ApiResponse> toggleAvailability(@PathVariable Long itemId) {
        MenuItemResponse data = menuService.toggleAvailability(itemId);
        return ResponseEntity.ok(ApiResponse.ok("Availability toggled", data));
    }

    @GetMapping("/orders/{restaurantId}")
    public ResponseEntity<ApiResponse> getOrders(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) OrderStatus status) {
        List<OrderResponse> data = (status != null)
                ? orderService.getRestaurantOrdersByStatus(restaurantId, status)
                : orderService.getRestaurantOrders(restaurantId);
        return ResponseEntity.ok(ApiResponse.ok("Success", data));
    }

    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest req) {
        OrderResponse data = orderService.updateStatus(orderId, req.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("Order status updated", data));
    }

    @GetMapping("/dashboard/{restaurantId}")
    public ResponseEntity<ApiResponse> getDashboard(@PathVariable Long restaurantId) {
        DashboardStats data = orderService.getDashboard(restaurantId);
        return ResponseEntity.ok(ApiResponse.ok("Success", data));
    }
}
