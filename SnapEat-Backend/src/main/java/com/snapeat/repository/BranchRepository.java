package com.snapeat.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.snapeat.entity.Branch;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {

    List<Branch> findByRestaurantIdAndActiveTrueOrderByCreatedAtAsc(Long restaurantId);

    List<Branch> findByRestaurantIdOrderByCreatedAtAsc(Long restaurantId);

    Optional<Branch> findByIdAndRestaurantId(Long id, Long restaurantId);

    long countByRestaurantIdAndActiveTrue(Long restaurantId);
}