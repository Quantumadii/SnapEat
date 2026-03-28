package com.snapeat.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.snapeat.entity.Order;
import com.snapeat.enums.OrderStatus;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
	
	List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Order> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
    void deleteByRestaurantId(Long restaurantId);
    List<Order> findByRestaurantIdAndStatusOrderByCreatedAtDesc(Long restaurantId, OrderStatus status);
    long countByRestaurantIdAndStatus(Long restaurantId, OrderStatus status);
    long countByRestaurantId(Long restaurantId);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
           "WHERE o.restaurant.id = :rId AND o.status = 'COMPLETED' AND o.createdAt >= :start")
    BigDecimal getDailyRevenue(@Param("rId") Long restaurantId,
                               @Param("start") LocalDateTime startOfDay);

    @Query(value = "SELECT o FROM Order o WHERE o.restaurant.id = :rId " +
                   "ORDER BY o.createdAt DESC LIMIT 10")
    List<Order> findRecentByRestaurant(@Param("rId") Long restaurantId);

    Optional<Order> findByStripePaymentIntentId(String stripePaymentIntentId);

    long countByStatus(OrderStatus status);

    @Query("SELECT o FROM Order o JOIN FETCH o.user WHERE o.id = :id")
    Optional<Order> findByIdWithUser(@Param("id") Long id);
}
