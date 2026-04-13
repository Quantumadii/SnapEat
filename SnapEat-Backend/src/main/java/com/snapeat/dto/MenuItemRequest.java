package com.snapeat.dto;

import java.math.BigDecimal;

import com.snapeat.enums.FoodCategory;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemRequest {
	
	@NotBlank(message = "Item name is required")
    private String name;

    private Long branchId;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    @NotNull(message = "Category is required")
    private FoodCategory category;

    private String imageUrl;
    private MultipartFile imageFile;
    private boolean available = true;
    private boolean veg = true;
    private String spiceLevel;
}
