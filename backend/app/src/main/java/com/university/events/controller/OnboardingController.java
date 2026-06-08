package com.university.events.controller;

import com.university.events.api.common.ApiResponse;
import com.university.events.api.dto.onboarding.CheckInRequest;
import com.university.events.api.dto.onboarding.CheckInResponse;
import com.university.events.api.dto.onboarding.OnboardingEventDto;
import com.university.events.api.dto.onboarding.RegistrantDto;
import com.university.events.service.OnboardingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/onboarding")
@RequiredArgsConstructor
@Tag(name = "Onboarding", description = "Venue check-in and today's events")
@PreAuthorize("hasAnyRole('COLLEGE_ADMIN', 'EVENT_ORGANIZER', 'SUPER_ADMIN', 'EVENT_MEMBER')")
public class OnboardingController {

    private final OnboardingService onboardingService;

    @GetMapping("/events/today")
    public ResponseEntity<ApiResponse<List<OnboardingEventDto>>> todayEvents() {
        return ResponseEntity.ok(ApiResponse.success(onboardingService.getTodayEvents()));
    }

    @GetMapping("/events/{eventId}/registrants")
    public ResponseEntity<ApiResponse<List<RegistrantDto>>> registrants(
            @PathVariable Long eventId,
            @RequestParam(value = "search", required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(onboardingService.getEventRegistrants(eventId, search)));
    }

    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<CheckInResponse>> checkIn(@Valid @RequestBody CheckInRequest request) {
        CheckInResponse result = onboardingService.checkIn(request);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
