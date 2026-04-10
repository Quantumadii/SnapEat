package com.snapeat.service;

import java.util.Map;

import org.springframework.data.domain.Pageable;

import com.snapeat.dto.PaginatedResponse;
import com.snapeat.dto.RestaurantRequest;
import com.snapeat.dto.RestaurantResponse;

public interface RestaurantService {

	PaginatedResponse<RestaurantResponse> getAllActive(Pageable pageable);

	RestaurantResponse getById(Long id);

	Map<String, Object> getStats();

	RestaurantResponse update(Long id, RestaurantRequest req);

}