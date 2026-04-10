package com.snapeat.controller;

import java.util.Map;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.snapeat.dto.ApiResponse;
import com.snapeat.dto.BranchResponse;
import com.snapeat.dto.PaginatedResponse;
import com.snapeat.dto.RestaurantResponse;
import com.snapeat.service.RestaurantService;
import com.snapeat.service.BranchService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {
	
	private final RestaurantService restaurantService;
	private final BranchService branchService;
	
	@GetMapping
	public ResponseEntity<ApiResponse> getAllActive(
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size) {
	    
	    Pageable pageable = PageRequest.of(page, size);
	    PaginatedResponse<RestaurantResponse> data = restaurantService.getAllActive(pageable);
	    
	    return ResponseEntity.ok(ApiResponse.ok("Success", data));
	}
	@GetMapping("/stats")
	public ResponseEntity<ApiResponse> getStats() {
		Map<String, Object> data = restaurantService.getStats();
		return ResponseEntity.ok(ApiResponse.ok("Success", data));
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse> getById(@PathVariable Long id){
		RestaurantResponse data = restaurantService.getById(id);
		return ResponseEntity.ok(ApiResponse.ok("Success", data));
	}

	@GetMapping("/{restaurantId}/branches")
	public ResponseEntity<ApiResponse> getBranches(@PathVariable Long restaurantId) {
		List<BranchResponse> data = branchService.getRestaurantBranches(restaurantId);
		return ResponseEntity.ok(ApiResponse.ok("Success", data));
	}
}
