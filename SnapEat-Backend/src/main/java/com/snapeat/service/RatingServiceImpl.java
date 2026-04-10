package com.snapeat.service;

import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.snapeat.dto.RatingRequest;
import com.snapeat.dto.RatingResponse;
import com.snapeat.entity.MenuItem;
import com.snapeat.entity.Rating;
import com.snapeat.entity.User;
import com.snapeat.repository.MenuItemRepository;
import com.snapeat.repository.RatingRepository;
import com.snapeat.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class RatingServiceImpl implements RatingService  {
	private final RatingRepository ratingRepo;
    private final UserRepository userRepo;
    private final MenuItemRepository menuRepo;

        @Override
		public RatingResponse submitRating(RatingRequest req) {
        User user = userRepo.findById(req.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        MenuItem item = menuRepo.findById(req.getMenuItemId())
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        Rating rating = Rating.builder()
                .user(user)
                .menuItem(item)
                .score(req.getScore())
                .comment(req.getComment())
                .build();

        Rating saved = ratingRepo.save(rating);

        return RatingResponse.builder()
                .id(saved.getId())
                .userName(user.getFullName())
                .dishName(item.getName())
                .score(saved.getScore())
                .comment(saved.getComment())
                .createdAt(saved.getCreatedAt().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")))
                .build();
    }
}
