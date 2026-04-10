package com.snapeat.controller;



import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.snapeat.dto.ApiResponse;
import com.snapeat.dto.RatingRequest;
import com.snapeat.dto.RatingResponse;
import com.snapeat.service.RatingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {
	
	private final RatingService ratingService;
	
	@PostMapping("/add")
    public ResponseEntity<ApiResponse> addRating(@Valid @RequestBody RatingRequest req) {
        RatingResponse data = ratingService.submitRating(req);
        return ResponseEntity.ok(ApiResponse.ok("Review submitted successfully", data));
    }
}
