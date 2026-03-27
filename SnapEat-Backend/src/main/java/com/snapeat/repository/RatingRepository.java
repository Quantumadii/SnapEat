package com.snapeat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.snapeat.entity.Rating;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
	
	boolean existsByUserIdAndMenuItemId(Long userId, Long menuItemId);

    void deleteByUserId(Long userId);

    void deleteByMenuItemRestaurantId(Long restaurantId);

    @Query("SELECT AVG(r.score) FROM Rating r WHERE r.menuItem.restaurant.id = :restaurantId")
    Double getAverageRatingForRestaurant(@Param("restaurantId") Long restaurantId);

    @Query("SELECT AVG(r.score) FROM Rating r")
    Double getOverallAverageRating();
}
