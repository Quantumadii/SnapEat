package com.snapeat.service;

import com.snapeat.dto.AuthResponse;
import com.snapeat.dto.ChangePasswordRequest;
import com.snapeat.dto.LoginRequest;
import com.snapeat.dto.RegisterRequest;
import com.snapeat.dto.ResetPasswordRequest;

public interface AuthService {

	AuthResponse register(RegisterRequest req);

	AuthResponse login(LoginRequest req);

	void forgotPassword(String email);

	void resetPassword(ResetPasswordRequest req);

	void changePassword(String email, ChangePasswordRequest req);

}