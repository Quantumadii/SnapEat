package com.snapeat.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.snapeat.dto.AuthResponse;
import com.snapeat.dto.LoginRequest;
import com.snapeat.dto.RegisterRequest;
import com.snapeat.entity.Restaurant;
import com.snapeat.entity.User;
import com.snapeat.enums.Role;
import com.snapeat.exception.DuplicateResourceException;
import com.snapeat.exception.ResourceNotFoundException;
import com.snapeat.repository.RestaurantRepository;
import com.snapeat.repository.UserRepository;
import com.snapeat.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {
	
	private final AuthenticationManager authManager;
	private final UserRepository userRepo;
	private final RestaurantRepository restaurantRepo;
	private final UserDetailsService userDetailsService;
	private final JwtUtil jwtUtil;
	private final PasswordEncoder passwordEncoder;
	
	public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new DuplicateResourceException("User", "email", req.getEmail());
        }

        User user = User.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(req.getRole() != null ? req.getRole() : Role.CUSTOMER)
                .build();
        user = userRepo.save(user);

        Long restaurantId = null;
        if (user.getRole() == Role.ADMIN) {
            Restaurant restaurant = Restaurant.builder()
                    .admin(user)
                    .name(req.getRestaurantName() != null
                            ? req.getRestaurantName()
                            : user.getFullName() + "'s Restaurant")
                    .description(req.getRestaurantDescription())
                    .address(req.getRestaurantAddress())
                    .area(req.getRestaurantArea() != null ? req.getRestaurantArea() : "")
                    .city(req.getRestaurantCity() != null ? req.getRestaurantCity() : "")
                    .instagramUrl(req.getRestaurantInstagram())
                    .contactEmail(req.getRestaurantContactEmail())
                    .contactPhone(req.getRestaurantPhone())
                    .openingHours(req.getOpeningHours())
                    .active(true)
                    .build();
            restaurantId = restaurantRepo.save(restaurant).getId();
        }
        
        var ud = userDetailsService.loadUserByUsername(user.getEmail());
        return AuthResponse.builder()
                .token(jwtUtil.generateToken(ud))
                .tokenType("Bearer")
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .restaurantId(restaurantId)
                .message("Registration successful")
                .build();
    }
	
	public AuthResponse login(LoginRequest req) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", req.getEmail()));

        Long restaurantId = null;
        if (user.getRole() == Role.ADMIN) {
            restaurantId = restaurantRepo.findByAdminId(user.getId())
                    .map(Restaurant::getId)
                    .orElse(null);
        }

        var ud = userDetailsService.loadUserByUsername(user.getEmail());
        return AuthResponse.builder()
                .token(jwtUtil.generateToken(ud))
                .tokenType("Bearer")
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .restaurantId(restaurantId)
                .message("Login successful")
                .build();
    }
}
