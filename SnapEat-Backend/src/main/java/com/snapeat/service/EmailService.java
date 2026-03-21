package com.snapeat.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.snapeat.config.AppProperties;
import com.snapeat.entity.User;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final AppProperties appProperties;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromAddress;	

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


}