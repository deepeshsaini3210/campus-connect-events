package com.university.events.service.notification;

import com.university.events.api.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Sends auth emails via SMTP when {@code app.mail.enabled=true}.
 * Configure {@code spring.mail.*} and optionally {@code MAIL_USERNAME}, {@code MAIL_PASSWORD}.
 */
@Service
@ConditionalOnProperty(prefix = "app.mail", name = "enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class MailAuthNotificationService implements AuthNotificationService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@localhost}")
    private String mailFrom;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Override
    public void sendEmailVerification(User user, String verificationToken) {
        String link = link("/verify-email?token=", verificationToken);
        try {
            sendMime(user.getEmail(), "Verify your email — MU Events", htmlVerify(link));
            log.info("Verification email sent to {}", user.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send verification email to {}", user.getEmail(), e);
            throw new RuntimeException("Could not send verification email", e);
        }
    }

    @Override
    public void sendPasswordReset(User user, String resetToken) {
        String link = link("/reset-password?token=", resetToken);
        try {
            sendMime(user.getEmail(), "Reset your password — MU Events", htmlReset(link));
            log.info("Password reset email sent to {}", user.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send password reset email to {}", user.getEmail(), e);
            throw new RuntimeException("Could not send password reset email", e);
        }
    }

    private String link(String pathSuffix, String token) {
        return frontendBaseUrl.replaceAll("/+$", "") + pathSuffix + token;
    }

    private void sendMime(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(mailFrom);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        mailSender.send(message);
    }

    private static String htmlVerify(String link) {
        return """
                <p>Welcome to MU Events.</p>
                <p><a href="%s">Click here to verify your email</a></p>
                <p>If you did not register, you can ignore this message.</p>
                """.formatted(link);
    }

    private static String htmlReset(String link) {
        return """
                <p>We received a request to reset your password.</p>
                <p><a href="%s">Click here to choose a new password</a></p>
                <p>This link expires soon. If you did not ask for a reset, ignore this email.</p>
                """.formatted(link);
    }
}
