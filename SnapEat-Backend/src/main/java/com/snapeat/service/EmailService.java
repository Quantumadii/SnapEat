package com.snapeat.service;

import com.snapeat.entity.Order;
import com.snapeat.entity.User;
import com.snapeat.enums.OrderStatus;

public interface EmailService {

	void sendWelcome(User user);

	void sendRegistrationOtp(String email, String fullName, String otp);

	void sendPasswordReset(User user, String token);

	void sendPasswordChanged(User user);

	void sendOrderConfirmation(Order order);

	void sendOrderStatusUpdate(String userEmail, String fullName, Long orderId, OrderStatus status);

	void sendContactMessage(String name, String email, String subject, String message);

}