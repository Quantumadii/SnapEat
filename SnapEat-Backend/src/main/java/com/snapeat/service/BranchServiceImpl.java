package com.snapeat.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.snapeat.dto.BranchRequest;
import com.snapeat.dto.BranchResponse;
import com.snapeat.entity.Branch;
import com.snapeat.entity.Restaurant;
import com.snapeat.exception.ResourceNotFoundException;
import com.snapeat.repository.BranchRepository;
import com.snapeat.repository.RestaurantRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class BranchServiceImpl implements BranchService {

    private final BranchRepository branchRepo;
    private final RestaurantRepository restaurantRepo;
    private final S3Service s3Service;

    @Override
    public List<BranchResponse> getRestaurantBranches(Long restaurantId) {
        if (!restaurantRepo.existsById(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant", restaurantId);
        }

        return branchRepo.findByRestaurantIdAndActiveTrueOrderByCreatedAtAsc(restaurantId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<BranchResponse> getAllRestaurantBranches(Long restaurantId) {
        if (!restaurantRepo.existsById(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant", restaurantId);
        }

        return branchRepo.findByRestaurantIdOrderByCreatedAtAsc(restaurantId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public BranchResponse getById(Long branchId) {
        return toResponse(branchRepo.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", branchId)));
    }

    @Override
    public BranchResponse create(Long restaurantId, BranchRequest req) {
        Restaurant restaurant = restaurantRepo.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", restaurantId));

        String imageUrl = resolveImageUrl(req.getImageFile(), req.getImageUrl());

        Branch branch = Branch.builder()
                .restaurant(restaurant)
                .branchName(req.getBranchName())
                .address(req.getAddress())
                .area(req.getArea())
                .city(req.getCity())
                .contactPhone(req.getContactPhone())
                .openingHours(req.getOpeningHours())
            .deliveryCoverage(req.getDeliveryCoverage())
                .imageUrl(imageUrl)
                .active(req.isActive())
                .build();

        return toResponse(branchRepo.save(branch));
    }

    @Override
    public BranchResponse update(Long branchId, BranchRequest req) {
        Branch branch = branchRepo.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", branchId));

        String imageUrl = resolveImageUrl(req.getImageFile(), req.getImageUrl());

        branch.setBranchName(req.getBranchName());
        branch.setAddress(req.getAddress());
        branch.setArea(req.getArea());
        branch.setCity(req.getCity());
        branch.setContactPhone(req.getContactPhone());
        branch.setOpeningHours(req.getOpeningHours());
        branch.setDeliveryCoverage(req.getDeliveryCoverage());
        if (imageUrl != null) {
            branch.setImageUrl(imageUrl);
        }
        branch.setActive(req.isActive());

        return toResponse(branchRepo.save(branch));
    }

    @Override
    public void delete(Long branchId) {
        Branch branch = branchRepo.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", branchId));
        branch.setActive(false);
        branchRepo.save(branch);
    }

    private BranchResponse toResponse(Branch branch) {
        return BranchResponse.builder()
                .id(branch.getId())
                .restaurantId(branch.getRestaurant().getId())
                .restaurantName(branch.getRestaurant().getName())
                .branchName(branch.getBranchName())
                .address(branch.getAddress())
                .area(branch.getArea())
                .city(branch.getCity())
                .contactPhone(branch.getContactPhone())
                .openingHours(branch.getOpeningHours())
                .deliveryCoverage(branch.getDeliveryCoverage())
                .imageUrl(branch.getImageUrl())
                .active(branch.isActive())
                .createdAt(branch.getCreatedAt())
                .build();
    }

    private String resolveImageUrl(org.springframework.web.multipart.MultipartFile file, String fallbackUrl) {
        if (file != null && !file.isEmpty()) {
            return s3Service.uploadFile(file);
        }
        return fallbackUrl;
    }
}