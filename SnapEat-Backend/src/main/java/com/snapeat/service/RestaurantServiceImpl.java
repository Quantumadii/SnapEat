package com.snapeat.service;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.snapeat.dto.PaginatedResponse;
import com.snapeat.dto.RestaurantRequest;
import com.snapeat.dto.RestaurantResponse;
import com.snapeat.entity.Restaurant;
import com.snapeat.enums.OrderStatus;
import com.snapeat.exception.ResourceNotFoundException;
import com.snapeat.repository.OrderRepository;
import com.snapeat.repository.RatingRepository;
import com.snapeat.repository.RestaurantRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class RestaurantServiceImpl implements RestaurantService {
	
	private final RestaurantRepository restaurantRepo;
	private final S3Service s3Service;
        private final OrderRepository orderRepo;
        private final RatingRepository ratingRepo;
	
	@Override
	public PaginatedResponse<RestaurantResponse> getAllActive(Pageable pageable) {
        Page<Restaurant> page = restaurantRepo.findByActiveTrue(pageable);
        return PaginatedResponse.<RestaurantResponse>builder()
            .content(page.getContent().stream().map(this::toResponse).toList())
            .pageNumber(page.getNumber())
            .pageSize(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .isFirst(page.isFirst())
            .isLast(page.isLast())
            .hasNext(page.hasNext())
            .hasPrevious(page.hasPrevious())
            .build();
    }
	
	@Override
	public RestaurantResponse getById(Long id) {
        return toResponse(restaurantRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", id)));
    }

        @Override
        public Map<String, Object> getStats() {
                long ordersDelivered = orderRepo.countByStatus(OrderStatus.COMPLETED);
                long restaurantPartners = restaurantRepo.countByActiveTrue();
                Double averageRating = ratingRepo.getOverallAverageRating();
                return Map.of(
                                "ordersDelivered", ordersDelivered,
                                "restaurantPartners", restaurantPartners,
                                "averageRating", averageRating != null ? averageRating : 0.0);
        }
	
	@Override
	public RestaurantResponse update(Long id, RestaurantRequest req) {
        Restaurant restaurant = restaurantRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", id));

                if (req.getImageFile() != null && !req.getImageFile().isEmpty()) {
                        restaurant.setImageUrl(s3Service.uploadFile(req.getImageFile()));
                }
                
        restaurant.setName(req.getName());
        restaurant.setDescription(req.getDescription());
        restaurant.setAddress(req.getAddress());
        restaurant.setArea(req.getArea());
        restaurant.setCity(req.getCity());
        restaurant.setInstagramUrl(req.getInstagramUrl());
        restaurant.setContactEmail(req.getContactEmail());
        restaurant.setContactPhone(req.getContactPhone());
        restaurant.setOpeningHours(req.getOpeningHours());
                if (req.getCustomerCancellationAllowedTill() != null) {
                        restaurant.setCustomerCancellationAllowedTill(req.getCustomerCancellationAllowedTill());
                }

        return toResponse(restaurantRepo.save(restaurant));
    }
	
	private RestaurantResponse toResponse(Restaurant r) {
                Double averageRating = ratingRepo.getAverageRatingForRestaurant(r.getId());
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
                                .customerCancellationAllowedTill(r.getCustomerCancellationAllowedTill())
                                .averageRating(averageRating != null ? averageRating : 0.0)
                .active(r.isActive())
                .build();
    }
}
