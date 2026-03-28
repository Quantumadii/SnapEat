package com.snapeat.service;

import java.util.List;

import com.snapeat.dto.MenuItemRequest;
import com.snapeat.dto.MenuItemResponse;
import com.snapeat.enums.FoodCategory;

public interface MenuService {

	List<MenuItemResponse> getPublicMenu(Long restaurantId);

	List<MenuItemResponse> getPublicMenuByCategory(Long restaurantId, FoodCategory category);

	List<MenuItemResponse> getAdminMenu(Long restaurantId);

	MenuItemResponse createItem(Long restaurantId, MenuItemRequest req);

	MenuItemResponse updateItem(Long itemId, MenuItemRequest req);

	void deleteItem(Long itemId);

	MenuItemResponse toggleAvailability(Long itemId);

}