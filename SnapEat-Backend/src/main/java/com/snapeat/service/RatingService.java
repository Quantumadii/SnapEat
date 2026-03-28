package com.snapeat.service;

import com.snapeat.dto.RatingRequest;
import com.snapeat.dto.RatingResponse;

public interface RatingService {

	RatingResponse submitRating(RatingRequest req);

}