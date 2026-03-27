package com.snapeat.service;

import java.util.List;
import java.util.Map;

import com.snapeat.dto.RestaurantRequest;
import com.snapeat.dto.RestaurantResponse;

public interface RestaurantService {

	List<RestaurantResponse> getAllActive();

	RestaurantResponse getById(Long id);

	Map<String, Object> getStats();

	RestaurantResponse update(Long id, RestaurantRequest req);

}