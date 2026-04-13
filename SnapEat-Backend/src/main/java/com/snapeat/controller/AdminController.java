package com.snapeat.controller;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
import com.snapeat.dto.BranchRequest;
import com.snapeat.dto.BranchResponse;
import com.snapeat.dto.DashboardStats;
import com.snapeat.dto.MenuItemRequest;
import com.snapeat.dto.MenuItemResponse;
import com.snapeat.dto.OrderResponse;
import com.snapeat.dto.PaginatedResponse;
import com.snapeat.dto.RestaurantRequest;
import com.snapeat.dto.RestaurantResponse;
import com.snapeat.dto.UpdateOrderStatusRequest;
import com.snapeat.enums.OrderStatus;
import com.snapeat.service.BranchService;
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
    private final BranchService branchService;
    private final MenuService menuService;
    private final OrderService orderService;

    @GetMapping("/restaurants/{id}")
    public ResponseEntity<ApiResponse> getRestaurant(@PathVariable Long id) {
        RestaurantResponse data = restaurantService.getById(id);
        return ResponseEntity.ok(ApiResponse.ok("Success", data));
    }

    @GetMapping("/restaurants/{restaurantId}/branches")
    public ResponseEntity<ApiResponse> getBranches(@PathVariable Long restaurantId) {
        List<BranchResponse> data = branchService.getAllRestaurantBranches(restaurantId);
        return ResponseEntity.ok(ApiResponse.ok("Success", data));
    }

    @PostMapping(value = "/restaurants/{restaurantId}/branches", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse> createBranch(
            @PathVariable Long restaurantId,
            @Valid @ModelAttribute BranchRequest req) {
        BranchResponse data = branchService.create(restaurantId, req);
        return ResponseEntity.ok(ApiResponse.ok("Branch created successfully", data));
    }

    @PutMapping(value = "/branches/{branchId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse> updateBranch(
            @PathVariable Long branchId,
            @Valid @ModelAttribute BranchRequest req) {
        BranchResponse data = branchService.update(branchId, req);
        return ResponseEntity.ok(ApiResponse.ok("Branch updated successfully", data));
    }

    @DeleteMapping("/branches/{branchId}")
    public ResponseEntity<ApiResponse> deleteBranch(@PathVariable Long branchId) {
        branchService.delete(branchId);
        return ResponseEntity.ok(ApiResponse.ok("Branch removed"));
    }

    @PutMapping(value = "/restaurants/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse> updateRestaurant(
            @PathVariable Long id,
            @Valid @ModelAttribute RestaurantRequest req) {
        RestaurantResponse data = restaurantService.update(id, req);
        return ResponseEntity.ok(ApiResponse.ok("Restaurant updated successfully", data));
    }

    @GetMapping("/restaurants/{restaurantId}/menu")
    public ResponseEntity<ApiResponse> getAllMenuItems(
            @PathVariable Long restaurantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PaginatedResponse<MenuItemResponse> data = menuService.getAdminMenu(restaurantId, page, size);
        return ResponseEntity.ok(ApiResponse.ok("Success", data));
    }

        @PostMapping(value = "/restaurants/{restaurantId}/menu", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
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

    @PatchMapping("/menu/item/{itemId}")
    public ResponseEntity<ApiResponse> toggleAvailability(@PathVariable Long itemId) {
        MenuItemResponse data = menuService.toggleAvailability(itemId);
        return ResponseEntity.ok(ApiResponse.ok("Availability toggled", data));
    }

    @GetMapping("/restaurants/{restaurantId}/orders")
    public ResponseEntity<ApiResponse> getOrders(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        PaginatedResponse<OrderResponse> data = (status != null)
                ? orderService.getRestaurantOrdersByStatus(restaurantId, status, page, size)
                : orderService.getRestaurantOrders(restaurantId, page, size);
        return ResponseEntity.ok(ApiResponse.ok("Success", data));
    }

    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest req) {
        OrderResponse data = orderService.updateStatus(orderId, req.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("Order status updated", data));
    }

    @GetMapping("/restaurants/{restaurantId}/dashboard")
    public ResponseEntity<ApiResponse> getDashboard(@PathVariable Long restaurantId) {
        DashboardStats data = orderService.getDashboard(restaurantId);
        return ResponseEntity.ok(ApiResponse.ok("Success", data));
    }
}
