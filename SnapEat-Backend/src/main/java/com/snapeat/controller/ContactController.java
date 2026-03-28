package com.snapeat.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.snapeat.dto.ApiResponse;
import com.snapeat.dto.ContactRequest;
import com.snapeat.service.EmailService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final EmailService emailService;

    @PostMapping
    public ResponseEntity<ApiResponse> submitContact(@Valid @RequestBody ContactRequest req) {
        emailService.sendContactMessage(req.getName(), req.getEmail(), req.getSubject(), req.getMessage());
        return ResponseEntity.ok(ApiResponse.ok("Message sent successfully"));
    }
}
