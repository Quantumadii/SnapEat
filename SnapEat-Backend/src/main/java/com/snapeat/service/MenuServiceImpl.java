package com.snapeat.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.snapeat.dto.MenuItemRequest;
import com.snapeat.dto.MenuItemResponse;
import com.snapeat.dto.PaginatedResponse;
import com.snapeat.entity.Branch;
import com.snapeat.entity.MenuItem;
import com.snapeat.entity.Restaurant;
import com.snapeat.exception.ResourceNotFoundException;
import com.snapeat.repository.BranchRepository;
import com.snapeat.repository.MenuItemRepository;
import com.snapeat.repository.RestaurantRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class MenuServiceImpl implements MenuService {
	
	private final MenuItemRepository menuRepo;
    private final RestaurantRepository restaurantRepo;
    private final BranchRepository branchRepo;
    private final S3Service s3Service;

    @Override
	public PaginatedResponse<MenuItemResponse> getPublicMenu(Long restaurantId, Long branchId, int page, int size) {
	    validateRestaurant(restaurantId);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<MenuItem> menuPage = menuRepo.findPublicMenuPage(restaurantId, branchId, pageable);
        List<MenuItemResponse> content = menuPage.getContent().stream().map(this::toResponse).toList();

        return PaginatedResponse.<MenuItemResponse>builder()
                .content(content)
                .pageNumber(menuPage.getNumber())
                .pageSize(menuPage.getSize())
                .totalElements(menuPage.getTotalElements())
                .totalPages(menuPage.getTotalPages())
                .isFirst(menuPage.isFirst())
                .isLast(menuPage.isLast())
                .hasNext(menuPage.hasNext())
                .hasPrevious(menuPage.hasPrevious())
                .build();
    }

    @Override
	    public PaginatedResponse<MenuItemResponse> getAdminMenu(Long restaurantId, int page, int size) {
    	validateRestaurant(restaurantId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<MenuItem> menuPage = menuRepo.findByRestaurantId(restaurantId, pageable);
        List<MenuItemResponse> content = menuPage.getContent().stream().map(this::toResponse).toList();
        return PaginatedResponse.<MenuItemResponse>builder()
            .content(content)
            .pageNumber(menuPage.getNumber())
            .pageSize(menuPage.getSize())
            .totalElements(menuPage.getTotalElements())
            .totalPages(menuPage.getTotalPages())
            .isFirst(menuPage.isFirst())
            .isLast(menuPage.isLast())
            .hasNext(menuPage.hasNext())
            .hasPrevious(menuPage.hasPrevious())
            .build();
    }

    @Override
	public MenuItemResponse createItem(Long restaurantId, MenuItemRequest req) {
        Restaurant restaurant = restaurantRepo.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", restaurantId));

    Branch branch = null;
    if (req.getBranchId() != null) {
        branch = branchRepo.findByIdAndRestaurantId(req.getBranchId(), restaurantId)
            .orElseThrow(() -> new ResourceNotFoundException("Branch", req.getBranchId()));
    }

    String imageUrl = null;
    if (req.getImageFile() != null && !req.getImageFile().isEmpty()) {
        imageUrl = s3Service.uploadFile(req.getImageFile());
    }
        
        MenuItem item = MenuItem.builder()
                .restaurant(restaurant)
            .branch(branch)
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
                .branchId(m.getBranch() != null ? m.getBranch().getId() : null)
                .branchName(m.getBranch() != null ? m.getBranch().getBranchName() : null)
                .name(m.getName())
                .description(m.getDescription())
                .price(m.getPrice())
                .category(m.getCategory())
                .categoryLabel(m.getCategory().getLabel())
                .imageUrl(m.getImageUrl())
                .available(m.isAvailable())
                .veg(m.isVeg())
                .spiceLevel(m.getSpiceLevel())
                .shared(m.getBranch() == null)
                .createdAt(m.getCreatedAt())
                .build();
    }
	
}
