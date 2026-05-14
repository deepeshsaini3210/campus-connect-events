package com.university.events.service.impl;

import com.university.events.api.dto.auth.AuthResponse;
import com.university.events.api.dto.auth.LoginRequest;
import com.university.events.api.dto.auth.RegisterRequest;
import com.university.events.api.entity.Role;
import com.university.events.api.entity.User;
import com.university.events.service.AuthService;
import com.university.events.service.mapper.UserMapper;
import com.university.events.service.notification.AuthNotificationService;
import com.university.events.service.repository.CollegeRepository;
import com.university.events.service.repository.RoleRepository;
import com.university.events.service.repository.UserRepository;
import com.university.events.service.security.JwtTokenProvider;
import com.university.events.service.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Authentication service implementation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private static final String USER_NOT_FOUND = "User not found";
    private static final String ROLE_NOT_FOUND = "Role not found";
    private static final String EMAIL_EXISTS = "Email already exists";
    private static final String ACCOUNT_DISABLED = "Account is disabled";
    private static final String INVALID_OR_EXPIRED_TOKEN = "Invalid or expired token";

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CollegeRepository collegeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final UserMapper userMapper;
    private final AuthNotificationService authNotificationService;

    @Value("${app.email-verification-expiry-hours:48}")
    private long emailVerificationExpiryHours;

    @Value("${app.password-reset-expiry-hours:2}")
    private long passwordResetExpiryHours;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException(EMAIL_EXISTS);
        }

        if (!roleRepository.existsById(request.getRoleId())) {
            throw new RuntimeException(ROLE_NOT_FOUND);
        }
        /* Reference-only association avoids loading Role.userRoles (prevents SO / deep cascades) */
        Role roleRef = roleRepository.getReferenceById(request.getRoleId());

        User user = userMapper.toEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(roleRef);

        if (request.getCollegeId() != null && collegeRepository.existsById(request.getCollegeId())) {
            user.setCollege(collegeRepository.getReferenceById(request.getCollegeId()));
        }

        if (!StringUtils.hasText(request.getPhone())) {
            user.setPhone(null);
        }

        String verificationToken = UUID.randomUUID().toString();
        user.setEmailVerificationToken(verificationToken);
        user.setEmailVerificationExpiresAt(LocalDateTime.now().plusHours(emailVerificationExpiryHours));

        User savedUser = userRepository.save(user);

        authNotificationService.sendEmailVerification(savedUser, verificationToken);

        String accessToken = tokenProvider.generateAccessToken(savedUser);
        String refreshToken = tokenProvider.generateRefreshToken(savedUser);

        log.info("User registered successfully: {}", request.getEmail());

        return userMapper.toAuthResponse(savedUser, accessToken, refreshToken, tokenProvider.getExpirationInMs());
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        log.info("User login attempt: {}", request.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException(USER_NOT_FOUND));

        if (!user.getIsActive()) {
            throw new RuntimeException(ACCOUNT_DISABLED);
        }

        String accessToken = tokenProvider.generateAccessToken(user);
        String refreshToken = tokenProvider.generateRefreshToken(user);

        log.info("User logged in successfully: {}", request.getEmail());

        return userMapper.toAuthResponse(user, accessToken, refreshToken, tokenProvider.getExpirationInMs());
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse refreshToken(String refreshToken) {
        log.info("Refreshing token");

        if (!tokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        String email = tokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException(USER_NOT_FOUND));

        if (!user.getIsActive()) {
            throw new RuntimeException(ACCOUNT_DISABLED);
        }

        String newAccessToken = tokenProvider.generateAccessToken(user);
        String newRefreshToken = tokenProvider.generateRefreshToken(user);

        return userMapper.toAuthResponse(user, newAccessToken, newRefreshToken, tokenProvider.getExpirationInMs());
    }

    @Override
    public void logout(String authorization) {
        log.info("User logout");

        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.substring(7);
            tokenProvider.invalidateToken(token);
        }

        SecurityContextHolder.clearContext();
    }

    @Override
    @Transactional
    public void forgotPassword(String email) {
        log.info("Forgot password request for: {}", email);

        userRepository.findByEmail(email).ifPresentOrElse(user -> {
            if (!Boolean.TRUE.equals(user.getIsActive())) {
                return;
            }
            String resetToken = UUID.randomUUID().toString();
            user.setPasswordResetToken(resetToken);
            user.setPasswordResetExpiresAt(LocalDateTime.now().plusHours(passwordResetExpiryHours));
            userRepository.save(user);
            authNotificationService.sendPasswordReset(user, resetToken);
        }, () -> log.debug("Forgot password: no user for email (response still generic)"));
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        log.info("Resetting password with token");

        User user = userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new RuntimeException(INVALID_OR_EXPIRED_TOKEN));

        if (user.getPasswordResetExpiresAt() == null
                || user.getPasswordResetExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException(INVALID_OR_EXPIRED_TOKEN);
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiresAt(null);
        userRepository.save(user);
        log.info("Password reset completed for user id {}", user.getId());
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        log.info("Verifying email with token");

        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new RuntimeException(INVALID_OR_EXPIRED_TOKEN));

        if (user.getEmailVerificationExpiresAt() == null
                || user.getEmailVerificationExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException(INVALID_OR_EXPIRED_TOKEN);
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiresAt(null);
        userRepository.save(user);
        log.info("Email verified for {}", user.getEmail());
    }

    @Override
    @Transactional
    public void resendEmailVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException(USER_NOT_FOUND));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Email is already verified");
        }

        String verificationToken = UUID.randomUUID().toString();
        user.setEmailVerificationToken(verificationToken);
        user.setEmailVerificationExpiresAt(LocalDateTime.now().plusHours(emailVerificationExpiryHours));
        userRepository.save(user);
        authNotificationService.sendEmailVerification(user, verificationToken);
    }
}
