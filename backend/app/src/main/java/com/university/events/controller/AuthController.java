package com.university.events.controller;

import com.university.events.api.common.ApiResponse;
import com.university.events.api.dto.auth.AuthResponse;
import com.university.events.api.dto.auth.ForgotPasswordRequest;
import com.university.events.api.dto.auth.LoginRequest;
import com.university.events.api.dto.auth.RegisterRequest;
import com.university.events.api.dto.auth.ResendVerificationRequest;
import com.university.events.api.dto.auth.ResetPasswordRequest;
import com.university.events.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Authentication controller for login, registration, and token management
 */
@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Register a new user with email verification")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User registered successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Email already exists")
    })
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT tokens")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login successful"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid credentials"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Account disabled")
    })
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Generate new access token using refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestHeader("Refresh-Token") String refreshToken) {
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /** Alias for clients that prefer path-based refresh */
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshTokenAlias(@RequestHeader("Refresh-Token") String refreshToken) {
        return refreshToken(refreshToken);
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Invalidate user tokens")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader(value = "Authorization", required = false) String authorization) {
        authService.logout(authorization != null ? authorization : "");
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot password", description = "Send password reset link to email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(null, "If an account exists for this email, password reset instructions were sent."));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Reset password using token from email link")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successful"));
    }

    @GetMapping("/verify-email")
    @Operation(summary = "Verify email (GET)", description = "Verify email when user opens link from mail client")
    public ResponseEntity<ApiResponse<Void>> verifyEmailGet(@RequestParam("token") String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success(null, "Email verified successfully"));
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verify email (POST)", description = "Verify email via JSON or query token")
    public ResponseEntity<ApiResponse<Void>> verifyEmailPost(@RequestParam(value = "token", required = false) String token,
                                                               @RequestBody(required = false) Map<String, String> body) {
        String t = token;
        if (t == null && body != null) {
            t = body.get("token");
        }
        if (t == null || t.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Token is required", HttpStatus.BAD_REQUEST));
        }
        authService.verifyEmail(t);
        return ResponseEntity.ok(ApiResponse.success(null, "Email verified successfully"));
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Resend verification email", description = "Send a new verification link")
    public ResponseEntity<ApiResponse<Void>> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        authService.resendEmailVerification(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(null, "Verification email sent"));
    }
}
