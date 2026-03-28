package com.snapeat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RestaurantResponse {
	
	private Long id;
    private String name;
    private String description;
    private String address;
    private String area;
    private String city;
    private String imageUrl;
    private String instagramUrl;
    private String contactEmail;
    private String contactPhone;
    private String openingHours;
    private boolean active;
	
}
