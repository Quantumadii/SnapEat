package com.snapeat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.snapeat.dto.ApiResponse;
import com.snapeat.dto.AuthResponse;
import com.snapeat.dto.ChangePasswordRequest;
import com.snapeat.dto.ForgotPasswordRequest;
import com.snapeat.dto.LoginRequest;
import com.snapeat.dto.RegisterRequest;
import com.snapeat.dto.ResetPasswordRequest;
import com.snapeat.dto.VerifyRegistrationOtpRequest;
import com.snapeat.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;

	@PostMapping("/register")
	public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest req) {
		AuthResponse data = authService.register(req);
		return ResponseEntity.ok(ApiResponse.ok("Registered successfully", data));
	}

	@PostMapping("/register/send-otp")
	public ResponseEntity<ApiResponse> sendRegisterOtp(@Valid @RequestBody RegisterRequest req) {
		authService.sendRegistrationOtp(req);
		return ResponseEntity.ok(ApiResponse.ok("OTP sent to your email"));
	}

	@PostMapping("/register/verify-otp")
	public ResponseEntity<ApiResponse> verifyRegisterOtp(@Valid @RequestBody VerifyRegistrationOtpRequest req) {
		AuthResponse data = authService.verifyRegistrationOtp(req);
		return ResponseEntity.ok(ApiResponse.ok("OTP verified", data));
	}

	@PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid  @RequestBody LoginRequest req) {
        AuthResponse data = authService.login(req);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", data)); 
	}
	
	@PostMapping("/forgot-password")
	public ResponseEntity<ApiResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req){
		authService.forgotPassword(req.getEmail());
		return ResponseEntity.ok(ApiResponse.ok("Password reset link sent to your email"));
	}
	
	@PostMapping("/reset-password")
	public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
	     authService.resetPassword(req);
	     return ResponseEntity.ok(ApiResponse.ok("Password reset successfully"));
	}
	
	@PostMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest req) {
        authService.changePassword(userDetails.getUsername(), req);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully"));
    }
	
}

