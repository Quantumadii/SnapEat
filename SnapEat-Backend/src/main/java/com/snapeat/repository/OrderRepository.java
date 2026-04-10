package com.snapeat.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.snapeat.entity.Order;
import com.snapeat.enums.OrderStatus;
import com.snapeat.enums.PaymentMethod;
import com.snapeat.enums.PaymentStatus;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
	
	Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
        @Query("""
                     SELECT o FROM Order o
                     WHERE o.restaurant.id = :restaurantId
                         AND (o.paymentMethod <> :onlineMethod OR o.paymentStatus = :paidStatus)
                     ORDER BY o.createdAt DESC
                     """)
        Page<Order> findVisibleByRestaurantIdOrderByCreatedAtDesc(
                        @Param("restaurantId") Long restaurantId,
                        @Param("onlineMethod") PaymentMethod onlineMethod,
                        @Param("paidStatus") PaymentStatus paidStatus,
                        Pageable pageable);

        @Query("""
                     SELECT o FROM Order o
                     WHERE o.restaurant.id = :restaurantId
                         AND o.status = :status
                         AND (o.paymentMethod <> :onlineMethod OR o.paymentStatus = :paidStatus)
                     ORDER BY o.createdAt DESC
                     """)
        Page<Order> findVisibleByRestaurantIdAndStatusOrderByCreatedAtDesc(
                        @Param("restaurantId") Long restaurantId,
                        @Param("status") OrderStatus status,
                        @Param("onlineMethod") PaymentMethod onlineMethod,
                        @Param("paidStatus") PaymentStatus paidStatus,
                        Pageable pageable);
    void deleteByRestaurantId(Long restaurantId);
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
    
    @Query("SELECT o FROM Order o WHERE o.restaurant.id = :rId ORDER BY o.createdAt DESC")
    Page<Order> findByRestaurant(@Param("rId") Long restaurantId, Pageable pageable);
}
