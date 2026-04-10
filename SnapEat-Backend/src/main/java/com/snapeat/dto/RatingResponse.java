package com.snapeat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RatingResponse {
	
	private Long id;
    private String userName;
    private String dishName;
    private int score;
    private String comment;
    private String createdAt;
}
