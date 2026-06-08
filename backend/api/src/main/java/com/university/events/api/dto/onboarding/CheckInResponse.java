package com.university.events.api.dto.onboarding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckInResponse {
    private boolean allowed;
    private boolean alreadyEntered;
    private String message;
    private String attendeeName;
    private String rollNumber;
    private String bookingReference;
}
