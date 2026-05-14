package com.university.events.service;

import com.university.events.api.dto.auth.AuthResponse;
import com.university.events.api.dto.auth.LoginRequest;
import com.university.events.api.dto.auth.RegisterRequest;

/**
 * Authentication service interface
 */
public interface AuthService {
    
    AuthResponse register(RegisterRequest request);
    
    AuthResponse login(LoginRequest request);
    
    AuthResponse refreshToken(String refreshToken);
    
    void logout(String authorization);
    
    void forgotPassword(String email);
    
    void resetPassword(String token, String newPassword);
    
    void verifyEmail(String token);

    void resendEmailVerification(String email);
}
