package com.university.events.api.dto.onboarding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OnboardingEventDto {
    private Long id;
    private String title;
    private String eventDate;
    private String eventTime;
    private String venue;
    private String category;
    private long registrantCount;
}
