package com.university.events.service.impl;

import com.university.events.api.dto.onboarding.CheckInRequest;
import com.university.events.api.dto.onboarding.CheckInResponse;
import com.university.events.api.dto.onboarding.OnboardingEventDto;
import com.university.events.api.dto.onboarding.RegistrantDto;
import com.university.events.api.entity.Booking;
import com.university.events.api.entity.Event;
import com.university.events.api.entity.User;
import com.university.events.service.OnboardingService;
import com.university.events.service.qrcode.QrCodeService;
import com.university.events.service.repository.BookingRepository;
import com.university.events.service.repository.EventRepository;
import com.university.events.service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OnboardingServiceImpl implements OnboardingService {

    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final QrCodeService qrCodeService;

    @Override
    @Transactional(readOnly = true)
    public List<OnboardingEventDto> getTodayEvents() {
        LocalDate today = LocalDate.now();
        return eventRepository.findTodayEvents(today).stream()
                .map(this::toOnboardingEvent)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RegistrantDto> getEventRegistrants(Long eventId, String search) {
        eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        String q = search != null ? search.trim() : "";
        List<Booking> bookings = q.isEmpty()
                ? bookingRepository.findPaidRegistrantsByEventId(eventId)
                : bookingRepository.searchPaidRegistrantsByEventId(eventId, q);

        return bookings.stream()
                .map(this::toRegistrant)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CheckInResponse checkIn(CheckInRequest request) {
        String entryCode = qrCodeService.parseEntryCode(request.getScannedPayload());
        if (entryCode == null || entryCode.isBlank()) {
            return CheckInResponse.builder()
                    .allowed(false)
                    .message("Invalid QR code")
                    .build();
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> codes = user.getEntryCodes() != null ? user.getEntryCodes() : List.of();
        if (!codes.contains(entryCode)) {
            return CheckInResponse.builder()
                    .allowed(false)
                    .message("Entry code does not belong to this user")
                    .build();
        }

        Booking booking = bookingRepository.findByBookingReferenceWithUser(entryCode)
                .orElseThrow(() -> new RuntimeException("Booking not found for this code"));

        if (!booking.getUser().getId().equals(user.getId())) {
            return CheckInResponse.builder()
                    .allowed(false)
                    .message("Entry code does not match selected user")
                    .build();
        }

        if (!booking.getEvent().getId().equals(request.getEventId())) {
            return CheckInResponse.builder()
                    .allowed(false)
                    .message("This pass is for a different event")
                    .build();
        }

        if (booking.getPaymentStatus() != Booking.PaymentStatus.COMPLETED) {
            return CheckInResponse.builder()
                    .allowed(false)
                    .message("Payment not completed for this registration")
                    .build();
        }

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            return CheckInResponse.builder()
                    .allowed(false)
                    .message("Registration was cancelled")
                    .build();
        }

        if (booking.getStatus() == Booking.BookingStatus.ATTENDED) {
            return CheckInResponse.builder()
                    .allowed(false)
                    .alreadyEntered(true)
                    .message("Already checked in — cannot scan again")
                    .attendeeName(fullName(user))
                    .rollNumber(user.getRollNumber())
                    .bookingReference(entryCode)
                    .build();
        }

        booking.setStatus(Booking.BookingStatus.ATTENDED);
        bookingRepository.save(booking);

        if (user.getEntryCodes() != null) {
            user.getEntryCodes().remove(entryCode);
        }
        userRepository.save(user);

        return CheckInResponse.builder()
                .allowed(true)
                .alreadyEntered(false)
                .message("Entry granted")
                .attendeeName(fullName(user))
                .rollNumber(user.getRollNumber())
                .bookingReference(entryCode)
                .build();
    }

    private OnboardingEventDto toOnboardingEvent(Event event) {
        long count = bookingRepository.countPaidRegistrantsByEventId(event.getId());
        return OnboardingEventDto.builder()
                .id(event.getId())
                .title(event.getTitle())
                .eventDate(event.getEventDate() != null ? event.getEventDate().toString() : null)
                .eventTime(event.getEventTime() != null ? event.getEventTime().toString() : null)
                .venue(event.getVenue())
                .category(event.getCategory() != null ? event.getCategory().getName() : null)
                .registrantCount(count)
                .build();
    }

    private RegistrantDto toRegistrant(Booking booking) {
        User user = booking.getUser();
        return RegistrantDto.builder()
                .userId(user.getId())
                .bookingId(booking.getId())
                .fullName(fullName(user))
                .email(user.getEmail())
                .rollNumber(user.getRollNumber())
                .bookingReference(booking.getBookingReference())
                .status(booking.getStatus().name())
                .entered(booking.getStatus() == Booking.BookingStatus.ATTENDED)
                .build();
    }

    private String fullName(User user) {
        return (user.getFirstName() + " " + user.getLastName()).trim();
    }
}
