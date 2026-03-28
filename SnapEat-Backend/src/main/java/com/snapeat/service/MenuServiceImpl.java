package com.snapeat.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.snapeat.dto.MenuItemRequest;
import com.snapeat.dto.MenuItemResponse;
import com.snapeat.entity.MenuItem;
import com.snapeat.entity.Restaurant;
import com.snapeat.enums.FoodCategory;
import com.snapeat.exception.ResourceNotFoundException;
import com.snapeat.repository.MenuItemRepository;
import com.snapeat.repository.RestaurantRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class MenuServiceImpl implements MenuService {
	
	private final MenuItemRepository menuRepo;
    private final RestaurantRepository restaurantRepo;
    private final S3Service s3Service;

    @Override
	public List<MenuItemResponse> getPublicMenu(Long restaurantId) {
    	validateRestaurant(restaurantId);
        return menuRepo.findByRestaurantIdAndAvailableTrue(restaurantId)
                .stream().map(this::toResponse).toList();
    }

    @Override
	public List<MenuItemResponse> getPublicMenuByCategory(Long restaurantId, FoodCategory category) {
    	validateRestaurant(restaurantId);
        return menuRepo.findByRestaurantIdAndAvailableTrueAndCategory(restaurantId, category)
                .stream().map(this::toResponse).toList();
    }

    @Override
	public List<MenuItemResponse> getAdminMenu(Long restaurantId) {
    	validateRestaurant(restaurantId);
        return menuRepo.findByRestaurantId(restaurantId)
                .stream().map(this::toResponse).toList();
    }

    @Override
	public MenuItemResponse createItem(Long restaurantId, MenuItemRequest req) {
        Restaurant restaurant = restaurantRepo.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", restaurantId));

    String imageUrl = null;
    if (req.getImageFile() != null && !req.getImageFile().isEmpty()) {
        imageUrl = s3Service.uploadFile(req.getImageFile());
    }
        
        MenuItem item = MenuItem.builder()
                .restaurant(restaurant)
                .name(req.getName())
                .description(req.getDescription())
                .price(req.getPrice())
                .category(req.getCategory())
        .imageUrl(imageUrl)
                .available(req.isAvailable())
                .veg(req.isVeg())
                .spiceLevel(req.getSpiceLevel())
                .build();

        return toResponse(menuRepo.save(item));
    }

    @Override
	public MenuItemResponse updateItem(Long itemId, MenuItemRequest req) {
        MenuItem item = menuRepo.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", itemId));

    if (req.getImageFile() != null && !req.getImageFile().isEmpty()) {
        item.setImageUrl(s3Service.uploadFile(req.getImageFile()));
    }

        item.setName(req.getName());
        item.setDescription(req.getDescription());
        item.setPrice(req.getPrice());
        item.setCategory(req.getCategory());
        item.setAvailable(req.isAvailable());
        item.setVeg(req.isVeg());
        item.setSpiceLevel(req.getSpiceLevel());

        return toResponse(menuRepo.save(item));
    }

    @Override
	public void deleteItem(Long itemId) {
        MenuItem item = menuRepo.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", itemId));
        item.setAvailable(false);
        menuRepo.save(item);
    }

    @Override
	public MenuItemResponse toggleAvailability(Long itemId) {
        MenuItem item = menuRepo.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", itemId));
        item.setAvailable(!item.isAvailable());
        return toResponse(menuRepo.save(item));
    }
    
    private void validateRestaurant(Long restaurantId) {
        if (!restaurantRepo.existsById(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant", restaurantId);
        }
    }

    private MenuItemResponse toResponse(MenuItem m) {
        return MenuItemResponse.builder()
                .id(m.getId())
                .restaurantId(m.getRestaurant().getId())
                .name(m.getName())
                .description(m.getDescription())
                .price(m.getPrice())
                .category(m.getCategory())
                .categoryLabel(m.getCategory().getLabel())
                .imageUrl(m.getImageUrl())
                .available(m.isAvailable())
                .veg(m.isVeg())
                .spiceLevel(m.getSpiceLevel())
                .createdAt(m.getCreatedAt())
                .build();
    }
	
}
