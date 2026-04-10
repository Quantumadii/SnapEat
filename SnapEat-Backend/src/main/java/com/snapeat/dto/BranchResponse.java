package com.snapeat.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BranchResponse {

    private Long id;
    private Long restaurantId;
    private String restaurantName;
    private String branchName;
    private String address;
    private String area;
    private String city;
    private String contactPhone;
    private String openingHours;
    private String deliveryCoverage;
    private String imageUrl;
    private boolean active;
    private LocalDateTime createdAt;
}