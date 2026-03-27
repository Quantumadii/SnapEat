package com.snapeat.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantRequest {
	
	@NotBlank(message = "Restaurant name is required")
    private String name;

    private String description;
    private String address;

    @NotBlank(message = "Area is required")
    private String area;

    @NotBlank(message = "City is required")
    private String city;

    private String imageUrl;
    private MultipartFile imageFile;
    private String instagramUrl;
    private String contactEmail;
    private String contactPhone;
    private String openingHours;
	
}
