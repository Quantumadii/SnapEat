package com.snapeat.service;

import java.util.List;

import com.snapeat.dto.BranchRequest;
import com.snapeat.dto.BranchResponse;

public interface BranchService {

    List<BranchResponse> getRestaurantBranches(Long restaurantId);

    List<BranchResponse> getAllRestaurantBranches(Long restaurantId);

    BranchResponse getById(Long branchId);

    BranchResponse create(Long restaurantId, BranchRequest req);

    BranchResponse update(Long branchId, BranchRequest req);

    void delete(Long branchId);
}