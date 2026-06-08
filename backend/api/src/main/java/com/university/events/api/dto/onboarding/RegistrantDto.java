package com.university.events.api.dto.onboarding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrantDto {
    private Long userId;
    private Long bookingId;
    private String fullName;
    private String email;
    private String rollNumber;
    private String bookingReference;
    private String status;
    private boolean entered;
}
