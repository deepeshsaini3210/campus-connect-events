package com.university.events.exception;

import com.university.events.api.common.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * Maps exceptions to consistent JSON API responses.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    private static final String EMAIL_EXISTS = "Email already exists";

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthentication(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid email or password", HttpStatus.UNAUTHORIZED));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        return ResponseEntity.badRequest().body(ApiResponse.error(msg, HttpStatus.BAD_REQUEST));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnreadable(HttpMessageNotReadableException ex) {
        log.warn("Bad request body: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponse.error("Invalid JSON or content type. Send application/json.", HttpStatus.BAD_REQUEST));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(DataIntegrityViolationException ex) {
        String cause = ex.getMostSpecificCause().getMessage();
        log.warn("Data integrity violation: {}", cause);

        String message = resolveDataIntegrityMessage(cause);
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(message, HttpStatus.CONFLICT));
    }

    private static String resolveDataIntegrityMessage(String cause) {
        if (cause == null) {
            return "Data conflict. The request could not be completed.";
        }
        String lower = cause.toLowerCase();
        if (lower.contains("unique_user_event") || (lower.contains("user_id") && lower.contains("event_id"))) {
            return "You are already registered for this event.";
        }
        if (lower.contains("booking_reference")) {
            return "Could not generate a unique booking reference. Please try again.";
        }
        if (lower.contains("email") && lower.contains("duplicate")) {
            return EMAIL_EXISTS;
        }
        if (lower.contains("created_at") || lower.contains("updated_at")) {
            return "Booking could not be saved. Please try again.";
        }
        return "Data conflict (duplicate or invalid reference). Check roles/colleges exist and email is unique.";
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntime(RuntimeException ex) {
        String message = ex.getMessage() != null ? ex.getMessage() : "Request failed";
        log.warn("{}: {}", ex.getClass().getSimpleName(), message);

        if (EMAIL_EXISTS.equals(message)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(message, HttpStatus.CONFLICT));
        }
        if ("Already booked for this event".equals(message)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(message, HttpStatus.CONFLICT));
        }

        return ResponseEntity.badRequest().body(ApiResponse.error(message, HttpStatus.BAD_REQUEST));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleAny(Exception ex) {
        log.error("Unhandled exception", ex);
        String msg = ex.getMessage() != null ? ex.getMessage() : "Internal server error";
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(msg, HttpStatus.INTERNAL_SERVER_ERROR));
    }
}
