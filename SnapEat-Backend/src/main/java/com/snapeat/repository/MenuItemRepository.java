package com.snapeat.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.snapeat.entity.MenuItem;
import com.snapeat.enums.FoodCategory;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
	
	List<MenuItem> findByRestaurantIdAndAvailableTrue(Long restaurantId);
    List<MenuItem> findByRestaurantIdAndBranchIsNullAndAvailableTrue(Long restaurantId);
    List<MenuItem> findByRestaurantIdAndBranchIdAndAvailableTrue(Long restaurantId, Long branchId);
    List<MenuItem> findByRestaurantId(Long restaurantId);
    Page<MenuItem> findByRestaurantId(Long restaurantId, Pageable pageable);
    Page<MenuItem> findByRestaurantIdAndCategory(Long restaurantId, FoodCategory category, Pageable pageable);
    List<MenuItem> findByRestaurantIdAndAvailableTrueAndCategory(Long restaurantId, FoodCategory category);
    List<MenuItem> findByRestaurantIdAndBranchIsNullAndAvailableTrueAndCategory(Long restaurantId, FoodCategory category);
    List<MenuItem> findByRestaurantIdAndBranchIdAndAvailableTrueAndCategory(Long restaurantId, Long branchId, FoodCategory category);
        @Query("""
                select m
                from MenuItem m
                where m.restaurant.id = :restaurantId
                    and m.available = true
                    and (
                                m.branch is null
                                or (:branchId is not null and m.branch.id = :branchId)
                            )
                """)
        Page<MenuItem> findPublicMenuPage(
                        @Param("restaurantId") Long restaurantId,
                        @Param("branchId") Long branchId,
                        Pageable pageable);
    long countByRestaurantIdAndAvailableTrue(Long restaurantId);
	
}
