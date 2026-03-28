package com.snapeat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.snapeat.entity.MenuItem;
import com.snapeat.enums.FoodCategory;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
	
	List<MenuItem> findByRestaurantIdAndAvailableTrue(Long restaurantId);
    List<MenuItem> findByRestaurantId(Long restaurantId);
    List<MenuItem> findByRestaurantIdAndAvailableTrueAndCategory(Long restaurantId, FoodCategory category);
    long countByRestaurantIdAndAvailableTrue(Long restaurantId);
	
}
