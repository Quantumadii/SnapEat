package com.snapeat.service;

import java.util.List;

import com.snapeat.dto.PaginatedResponse;
import com.snapeat.dto.MenuItemRequest;
import com.snapeat.dto.MenuItemResponse;

public interface MenuService {

	PaginatedResponse<MenuItemResponse> getPublicMenu(Long restaurantId, Long branchId, int page, int size);

	PaginatedResponse<MenuItemResponse> getAdminMenu(Long restaurantId, int page, int size);

	MenuItemResponse createItem(Long restaurantId, MenuItemRequest req);

	MenuItemResponse updateItem(Long itemId, MenuItemRequest req);

	void deleteItem(Long itemId);

	MenuItemResponse toggleAvailability(Long itemId);

}