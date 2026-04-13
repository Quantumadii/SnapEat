package com.snapeat.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.snapeat.enums.FoodCategory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItemResponse {
	
	private Long id;
    private Long restaurantId;
    private Long branchId;
    private String branchName;
    private String name;
    private String description;
    private BigDecimal price;
    private FoodCategory category;
    private String categoryLabel;
    private String imageUrl;
    private boolean available;
    private boolean veg;
    private String spiceLevel;
    private boolean shared;
    private LocalDateTime createdAt;
    
}
