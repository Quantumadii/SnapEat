package com.snapeat.repository;

import com.snapeat.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
	
    Optional<Restaurant> findByAdminId(Long adminId);

    long countByActiveTrue();
}

