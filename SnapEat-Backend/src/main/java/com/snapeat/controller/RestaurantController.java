package com.snapeat.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.snapeat.dto.ApiResponse;
import com.snapeat.dto.RestaurantResponse;
import com.snapeat.service.RestaurantService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {
	private final RestaurantService restaurantService;
	
	@GetMapping
	public ResponseEntity<ApiResponse> getAllActive() {
        List<RestaurantResponse> data = restaurantService.getAllActive();
        return ResponseEntity.ok(ApiResponse.ok("Success", data));
    }
	
	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse> getById(@PathVariable Long id){
		RestaurantResponse data = restaurantService.getById(id);
		return ResponseEntity.ok(ApiResponse.ok("Success", data));
	}
}
