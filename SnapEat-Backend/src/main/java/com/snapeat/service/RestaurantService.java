package com.snapeat.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.snapeat.dto.RestaurantRequest;
import com.snapeat.dto.RestaurantResponse;
import com.snapeat.entity.Restaurant;
import com.snapeat.exception.ResourceNotFoundException;
import com.snapeat.repository.RestaurantRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class RestaurantService {
	
	private final RestaurantRepository restaurantRepo;
	
	public List<RestaurantResponse> getAllActive() {
        return restaurantRepo.findAll().stream()
                .filter(Restaurant::isActive)
                .map(this::toResponse)
                .toList();	      
    }
	
	public RestaurantResponse getById(Long id) {
        return toResponse(restaurantRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", id)));
    }
	
	public RestaurantResponse update(Long id, RestaurantRequest req) {
        Restaurant restaurant = restaurantRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", id));

        restaurant.setName(req.getName());
        restaurant.setDescription(req.getDescription());
        restaurant.setAddress(req.getAddress());
        restaurant.setArea(req.getArea());
        restaurant.setCity(req.getCity());
        restaurant.setImageUrl(req.getImageUrl());
        restaurant.setInstagramUrl(req.getInstagramUrl());
        restaurant.setContactEmail(req.getContactEmail());
        restaurant.setContactPhone(req.getContactPhone());
        restaurant.setOpeningHours(req.getOpeningHours());

        return toResponse(restaurantRepo.save(restaurant));
    }
	
	private RestaurantResponse toResponse(Restaurant r) {
        return RestaurantResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .description(r.getDescription())
                .address(r.getAddress())
                .area(r.getArea())
                .city(r.getCity())
                .imageUrl(r.getImageUrl())
                .instagramUrl(r.getInstagramUrl())
                .contactEmail(r.getContactEmail())
                .contactPhone(r.getContactPhone())
                .openingHours(r.getOpeningHours())
                .active(r.isActive())
                .build();
    }
}
