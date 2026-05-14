package com.university.events.service.notification;

import com.university.events.api.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * Logs verification and reset URLs to the console when SMTP is disabled ({@code app.mail.enabled=false}).
 */
@Service
@ConditionalOnProperty(prefix = "app.mail", name = "enabled", havingValue = "false", matchIfMissing = true)
@Slf4j
public class LoggingAuthNotificationService implements AuthNotificationService {

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Value("${app.backend-public-url:http://localhost:8081/api}")
    private String backendPublicUrl;

    @Override
    public void sendEmailVerification(User user, String verificationToken) {
        String spaLink = frontendBaseUrl.replaceAll("/+$", "") + "/verify-email?token=" + verificationToken;
        String apiLink = backendPublicUrl.replaceAll("/+$", "") + "/v1/auth/verify-email?token=" + verificationToken;
        log.warn(
                """
                        \n================================================================================
                        VERIFICATION LINK (SMTP disabled: app.mail.enabled=false). No email was sent.
                        User: {}
                        Open in browser (SPA): {}
                        Or verify via API (returns JSON): {}
                        To send real mail: MAIL_ENABLED=true + MAIL_USERNAME/MAIL_PASSWORD + spring.mail.host (see application.yml).
                        ================================================================================
                        """,
                user.getEmail(),
                spaLink,
                apiLink);
    }

    @Override
    public void sendPasswordReset(User user, String resetToken) {
        String spaLink = frontendBaseUrl.replaceAll("/+$", "") + "/reset-password?token=" + resetToken;
        log.warn(
                """
                        \n================================================================================
                        PASSWORD RESET LINK (SMTP disabled). No email was sent.
                        User: {}
                        Open in browser (SPA): {}
                        ================================================================================
                        """,
                user.getEmail(),
                spaLink);
    }
}
