package com.snapeat.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.snapeat.config.AppProperties;
import com.snapeat.entity.Order;
import com.snapeat.entity.User;
import com.snapeat.enums.OrderStatus;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final AppProperties appProperties;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromAddress;	

    @Value("${app.support-email}")
    private String supportEmail;

    private String appName() {
        return appProperties.getName();
    }

    private String frontendUrl() {
        return appProperties.getFrontendUrl();
    }

    private void send(String to, String subject, String html) {
        try {

            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress, appName());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(message);

            log.info("Email sent → {} | {}", to, subject);

        } catch (Exception e) {
            log.error("Email failed → {} : {}", to, e.getMessage());
        }
    }

    private String processTemplate(String templateName, Context context) {
        return templateEngine.process(templateName, context);
    }

    @Override
	@Async
    public void sendWelcome(User user) {

        Context context = new Context();

        context.setVariable("name", user.getFullName());
        context.setVariable("appName", appName());
        context.setVariable("frontendUrl", frontendUrl());
        context.setVariable("isAdmin",
                user.getRole().name().equals("ADMIN"));

        String html = processTemplate("email/welcome", context);

        send(
                user.getEmail(),
                "Welcome to " + appName() + " 🎉",
                html
        );
    }

    @Override
	@Async
    public void sendRegistrationOtp(String email, String fullName, String otp) {
        Context context = new Context();
        context.setVariable("appName", appName());
        context.setVariable("name", fullName);
        context.setVariable("otp", otp);

        String html = processTemplate("email/registration-otp", context);

        send(
                email,
                appName() + " - Verify your email",
                html
        );
    }

    @Override
	@Async
    public void sendPasswordReset(User user, String token) {

        String resetLink =
                frontendUrl() + "/reset-password?token=" + token;

        Context context = new Context();

        context.setVariable("name", user.getFullName());
        context.setVariable("appName", appName());
        context.setVariable("resetLink", resetLink);

        String html =
                processTemplate("email/password-reset", context);

        send(
                user.getEmail(),
                appName() + " - Password Reset",
                html
        );
    }

    @Override
	@Async
    public void sendPasswordChanged(User user) {

        Context context = new Context();

        context.setVariable("name", user.getFullName());
        context.setVariable("appName", appName());

        String html =
                processTemplate("email/password-changed", context);

        send(
                user.getEmail(),
                appName() + " - Password Changed",
                html
        );
    }
    
    @Override
	@Async
    public void sendOrderConfirmation(Order order) {

        Context context = new Context();
        context.setVariable("appName", appName());
        context.setVariable("fullName", order.getUser().getFullName());
        context.setVariable("restaurantName", order.getRestaurant().getName());
        context.setVariable("orderId", order.getId());
        context.setVariable("items", order.getOrderItems());
        context.setVariable("totalAmount", order.getTotalAmount());
        context.setVariable("trackUrl", frontendUrl() + "/orders");
        
        String fullAddress = String.format("%s, %s, %s – %s", 
            order.getFlatNo(), order.getDeliveryArea(), order.getDeliveryCity(), order.getPincode());
        context.setVariable("address", fullAddress);

        String htmlContent = templateEngine.process("email/order-confirmation", context);

        send(
            order.getUser().getEmail(),
            "Order #" + order.getId() + " Received",
            htmlContent
        );
    }

    @Override
	@Async
    public void sendOrderStatusUpdate(String userEmail, String fullName, Long orderId, OrderStatus status) {

        String color = switch (status) {
            case CONFIRMED -> "#2563eb";
            case PREPARING -> "#f39c12"; 
            case READY     -> "#27ae60"; 
            case COMPLETED -> "#2ecc71"; 
            case CANCELLED -> "#e74c3c"; 
            default        -> "#3498db"; 
        };

        String statusMsg = switch (status) {
            case CONFIRMED -> "Your order has been accepted by the restaurant and confirmed!";
            case PREPARING -> "The restaurant has started preparing your food! 🍳";
            case READY     -> "Your order is ready and on its way! 🚴";
            case COMPLETED -> "Your order has been delivered. Enjoy your meal! 😋";
            case CANCELLED -> "Your order was cancelled. We're sorry for the inconvenience.";
            default        -> "Your order status has been updated.";
        };

        Context context = new Context();
        context.setVariable("appName", appName());
        context.setVariable("fullName", fullName);
        context.setVariable("orderId", orderId);
        context.setVariable("status", status.toString());
        context.setVariable("statusColor", color);
        context.setVariable("statusMsg", statusMsg);
        context.setVariable("trackUrl", frontendUrl() + "/orders");

        String htmlContent = templateEngine.process("email/order-status-update", context);

        send(
            userEmail,
            "Order #" + orderId + " is " + status,
            htmlContent
        );
    }

    @Override
	@Async
    public void sendContactMessage(String name, String email, String subject, String message) {
        SimpleMailMessage supportMessage = new SimpleMailMessage();
        supportMessage.setFrom(fromAddress);
        supportMessage.setTo(supportEmail);
        supportMessage.setSubject("[Contact Form] " + subject);
        supportMessage.setReplyTo(email);
        supportMessage.setText("Name: " + name + "\n"
                + "Email: " + email + "\n\n"
                + "Message:\n" + message);
        mailSender.send(supportMessage);
        log.info("Contact message forwarded -> {}", supportEmail);
    }

}