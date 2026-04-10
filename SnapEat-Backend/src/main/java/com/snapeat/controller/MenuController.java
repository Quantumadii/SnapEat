package com.snapeat.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.snapeat.dto.ApiResponse;
import com.snapeat.dto.MenuItemResponse;
import com.snapeat.dto.PaginatedResponse;
import com.snapeat.service.MenuService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class MenuController {
		
	private final MenuService menuService;

    @GetMapping("/{restaurantId}/menu")
    public ResponseEntity<ApiResponse> getMenu(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) Long branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {

        PaginatedResponse<MenuItemResponse> data = menuService.getPublicMenu(restaurantId, branchId, page, size);

        return ResponseEntity.ok(ApiResponse.ok("Success", data));
    }
}
