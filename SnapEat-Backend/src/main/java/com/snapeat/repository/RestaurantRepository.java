package com.snapeat.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.snapeat.entity.Restaurant;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
	
    Optional<Restaurant> findByAdminId(Long adminId);
    Page<Restaurant> findByActiveTrue(Pageable pageable);

    long countByActiveTrue();
}

