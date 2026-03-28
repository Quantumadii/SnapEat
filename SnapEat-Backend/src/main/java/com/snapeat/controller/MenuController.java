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
import com.snapeat.enums.FoodCategory;
import com.snapeat.service.MenuService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuController {
		
	private final MenuService menuService;

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<ApiResponse> getMenu(
            @PathVariable Long restaurantId,
            @RequestParam(required = false) FoodCategory category) {

        List<MenuItemResponse> data = (category != null)
                ? menuService.getPublicMenuByCategory(restaurantId, category)
                : menuService.getPublicMenu(restaurantId);

        return ResponseEntity.ok(ApiResponse.ok("Success", data));
    }
}
