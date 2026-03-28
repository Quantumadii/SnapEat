package com.snapeat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.snapeat.dto.ApiResponse;
import com.snapeat.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    private final AuthService authService;

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse> deleteMyAccount(@AuthenticationPrincipal UserDetails userDetails) {
        authService.deleteAccount(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Account deleted successfully"));
    }
}
