package com.snapeat.dto;

import com.snapeat.enums.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
	
	@NotBlank(message = "Full name is required")
    private String fullName;

    @Email(message = "Invalid email address")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private Role role = Role.CUSTOMER;

    private String restaurantName;
    private String restaurantDescription;
    private String restaurantAddress;
    private String restaurantArea;
    private String restaurantCity;
    private String restaurantPhone;
    private String restaurantInstagram;
    private String restaurantContactEmail;
    private String openingHours;
}
