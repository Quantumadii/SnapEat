package com.snapeat.service;

import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;
import java.util.UUID;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.snapeat.dto.AuthResponse;
import com.snapeat.dto.ChangePasswordRequest;
import com.snapeat.dto.LoginRequest;
import com.snapeat.dto.RegisterRequest;
import com.snapeat.dto.ResetPasswordRequest;
import com.snapeat.dto.VerifyRegistrationOtpRequest;
import com.snapeat.entity.RegistrationOtp;
import com.snapeat.entity.Restaurant;
import com.snapeat.entity.User;
import com.snapeat.enums.Role;
import com.snapeat.exception.DuplicateResourceException;
import com.snapeat.exception.InvalidTokenException;
import com.snapeat.exception.ResourceNotFoundException;
import com.snapeat.repository.RatingRepository;
import com.snapeat.repository.OrderRepository;
import com.snapeat.repository.RestaurantRepository;
import com.snapeat.repository.RegistrationOtpRepository;
import com.snapeat.repository.UserRepository;
import com.snapeat.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {
	
	private final AuthenticationManager authManager;
	private final UserRepository userRepo;
	private final RestaurantRepository restaurantRepo;
	private final UserDetailsService userDetailsService;
	private final JwtUtil jwtUtil;
	private final PasswordEncoder passwordEncoder;
	private final EmailService emailService;
    private final RegistrationOtpRepository registrationOtpRepo;
    private final RatingRepository ratingRepo;
    private final OrderRepository orderRepo;
	
	@Override
	public AuthResponse register(RegisterRequest req) {
                return createAccount(req, passwordEncoder.encode(req.getPassword()));
    }

                @Override
                @Transactional(propagation = Propagation.NOT_SUPPORTED)
                public void sendRegistrationOtp(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new DuplicateResourceException("User", "email", req.getEmail());
        }

        String otp = String.format("%06d", ThreadLocalRandom.current().nextInt(0, 1_000_000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);
        String passwordHash = passwordEncoder.encode(req.getPassword());

        RegistrationOtp registrationOtp = registrationOtpRepo.findByEmail(req.getEmail())
                .orElseGet(RegistrationOtp::new);

        registrationOtp.setFullName(req.getFullName());
        registrationOtp.setEmail(req.getEmail());
        registrationOtp.setPasswordHash(passwordHash);
        registrationOtp.setRole(req.getRole() != null ? req.getRole() : Role.CUSTOMER);
        registrationOtp.setRestaurantName(req.getRestaurantName());
        registrationOtp.setRestaurantDescription(req.getRestaurantDescription());
        registrationOtp.setRestaurantAddress(req.getRestaurantAddress());
        registrationOtp.setRestaurantArea(req.getRestaurantArea());
        registrationOtp.setRestaurantCity(req.getRestaurantCity());
        registrationOtp.setRestaurantPhone(req.getRestaurantPhone());
        registrationOtp.setRestaurantInstagram(req.getRestaurantInstagram());
        registrationOtp.setRestaurantContactEmail(req.getRestaurantContactEmail());
        registrationOtp.setOpeningHours(req.getOpeningHours());
        registrationOtp.setOtp(otp);
        registrationOtp.setExpiresAt(expiresAt);

        registrationOtpRepo.save(registrationOtp);
        emailService.sendRegistrationOtp(req.getEmail(), req.getFullName(), otp);
        }

        @Override
        public AuthResponse verifyRegistrationOtp(VerifyRegistrationOtpRequest req) {
                RegistrationOtp registrationOtp = registrationOtpRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new InvalidTokenException("OTP is invalid or expired"));

                if (registrationOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
                        registrationOtpRepo.delete(registrationOtp);
                        throw new InvalidTokenException("OTP has expired. Please request a new OTP.");
                }

                if (!registrationOtp.getOtp().equals(req.getOtp())) {
                        throw new InvalidTokenException("Invalid OTP. Please try again.");
                }

                RegisterRequest registerRequest = new RegisterRequest(
                                registrationOtp.getFullName(),
                                registrationOtp.getEmail(),
                                "",
                                registrationOtp.getRole(),
                                registrationOtp.getRestaurantName(),
                                registrationOtp.getRestaurantDescription(),
                                registrationOtp.getRestaurantAddress(),
                                registrationOtp.getRestaurantArea(),
                                registrationOtp.getRestaurantCity(),
                                registrationOtp.getRestaurantPhone(),
                                registrationOtp.getRestaurantInstagram(),
                                registrationOtp.getRestaurantContactEmail(),
                                registrationOtp.getOpeningHours());

                AuthResponse response = createAccount(registerRequest, registrationOtp.getPasswordHash());
                registrationOtpRepo.delete(registrationOtp);
                return response;
        }

        private AuthResponse createAccount(RegisterRequest req, String passwordHash) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new DuplicateResourceException("User", "email", req.getEmail());
        }

        User user = User.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .password(passwordHash)
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
        
        emailService.sendWelcome(user);
        
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
	
	@Override
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
	
	@Override
	public void forgotPassword(String email) {
		User user = userRepo.findByEmail(email)
				.orElseThrow(()-> new ResourceNotFoundException("No account found with email: "+email));
		String token = UUID.randomUUID().toString();
		user.setResetToken(token);
		user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
		userRepo.save(user);
		
		 emailService.sendPasswordReset(user, token);
		
	}
	
	@Override
	public void resetPassword(ResetPasswordRequest req) {
		User user = userRepo.findByResetToken(req.getToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired password reset token"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Password reset token has expired. Please request a new one.");
        }
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepo.save(user);
        
        emailService.sendPasswordChanged(user);
        
	}
	
	@Override
	public void changePassword(String email, ChangePasswordRequest req) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new InvalidTokenException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepo.save(user);
        
        emailService.sendPasswordChanged(user);
        
    }

        @Override
        public void deleteAccount(String email) {
                User user = userRepo.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

                if (user.getRole() == Role.ADMIN) {
                        restaurantRepo.findByAdminId(user.getId())
                                        .ifPresent(restaurant -> {
                                                ratingRepo.deleteByMenuItemRestaurantId(restaurant.getId());
                                                orderRepo.deleteByRestaurantId(restaurant.getId());
                                        });
                }

                ratingRepo.deleteByUserId(user.getId());
                registrationOtpRepo.deleteByEmail(user.getEmail());
                userRepo.delete(user);
        }
}

