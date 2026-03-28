package com.snapeat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RatingRequest {
	
	private Long userId;
    private Long menuItemId;
    private int score;
    private String comment;
}
