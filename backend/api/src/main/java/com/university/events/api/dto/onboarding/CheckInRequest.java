package com.university.events.api.dto.onboarding;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CheckInRequest {
    @NotNull
    private Long userId;

    @NotNull
    private Long eventId;

    @NotBlank
    private String scannedPayload;
}
