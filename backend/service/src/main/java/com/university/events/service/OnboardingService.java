package com.university.events.service;

import com.university.events.api.dto.onboarding.CheckInRequest;
import com.university.events.api.dto.onboarding.CheckInResponse;
import com.university.events.api.dto.onboarding.OnboardingEventDto;
import com.university.events.api.dto.onboarding.RegistrantDto;

import java.util.List;

public interface OnboardingService {

    List<OnboardingEventDto> getTodayEvents();

    List<RegistrantDto> getEventRegistrants(Long eventId, String search);

    CheckInResponse checkIn(CheckInRequest request);
}
