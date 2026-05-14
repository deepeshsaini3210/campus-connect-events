package com.university.events.service.notification;

import com.university.events.api.entity.User;

/**
 * Sends auth-related messages. Default implementation logs links (dev); swap for SMTP later.
 */
public interface AuthNotificationService {

    void sendEmailVerification(User user, String verificationToken);

    void sendPasswordReset(User user, String resetToken);
}
