package com.snapeat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.snapeat.dto.ApiResponse;
import com.snapeat.dto.AuthResponse;
import com.snapeat.dto.LoginRequest;
import com.snapeat.dto.RegisterRequest;
import com.snapeat.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
	
	private final AuthService authService;
	
	 @PostMapping("/register")
	    public ResponseEntity<ApiResponse> register(
	            @Valid @RequestBody RegisterRequest req) {
	        AuthResponse data = authService.register(req);
	        return ResponseEntity.ok(ApiResponse.ok("Registered successfully", data));
	   }
	
	@PostMapping("/login")
    public ResponseEntity<ApiResponse> login(
            @Valid @RequestBody LoginRequest req) {
        AuthResponse data = authService.login(req);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", data));
    }
}
