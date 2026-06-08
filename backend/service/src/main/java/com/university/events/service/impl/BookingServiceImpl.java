package com.university.events.service.impl;

import com.university.events.api.common.PaginatedResponse;
import com.university.events.api.dto.booking.BookingDto;
import com.university.events.api.dto.booking.CreateBookingRequest;
import com.university.events.api.entity.Booking;
import com.university.events.api.entity.Event;
import com.university.events.api.entity.User;
import com.university.events.service.BookingService;
import com.university.events.service.mapper.BookingMapper;
import com.university.events.service.qrcode.QrCodeService;
import com.university.events.service.repository.BookingRepository;
import com.university.events.service.repository.EventRepository;
import com.university.events.service.repository.UserRepository;
import com.university.events.service.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private static final String BOOKING_NOT_FOUND = "Booking not found";
    private static final String EVENT_NOT_FOUND = "Event not found";
    private static final String USER_NOT_FOUND = "User not found";
    private static final String NO_SEATS_AVAILABLE = "No seats available for this event";
    private static final String ALREADY_BOOKED = "Already booked for this event";
    private static final String PAYMENT_REQUIRED = "Complete payment before your entry pass is issued";
    private static final String INVALID_ENTRY_CODE = "Invalid or unknown entry code";

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;
    private final QrCodeService qrCodeService;

    @Override
    @Transactional
    public BookingDto createBooking(CreateBookingRequest request) {
        log.info("Creating booking for event: {}", request.getEventId());

        Event event = eventRepository.findActiveEventById(request.getEventId())
                .orElseThrow(() -> new RuntimeException(EVENT_NOT_FOUND));

        if (event.getSeatsLeft() <= 0) {
            throw new RuntimeException(NO_SEATS_AVAILABLE);
        }

        User user = userRepository.findById(SecurityUtils.requireCurrentUserId())
                .orElseThrow(() -> new RuntimeException(USER_NOT_FOUND));
        applyRollNumber(user, request.getRollNumber());

        boolean paidEvent = event.getFee().doubleValue() > 0;

        Optional<Booking> existing = bookingRepository.findByUserIdAndEventId(user.getId(), event.getId());
        if (existing.isPresent()) {
            Booking prior = existing.get();
            if (prior.getStatus() != Booking.BookingStatus.CANCELLED) {
                throw new RuntimeException(ALREADY_BOOKED);
            }
            if (event.getSeatsLeft() <= 0) {
                throw new RuntimeException(NO_SEATS_AVAILABLE);
            }
            applyNewEntryCredentials(prior);
            prior.setStatus(paidEvent ? Booking.BookingStatus.PENDING : Booking.BookingStatus.CONFIRMED);
            prior.setPaymentStatus(paidEvent ? Booking.PaymentStatus.PENDING : Booking.PaymentStatus.COMPLETED);
            prior.setPaymentAmount(event.getFee());
            prior.setUpdatedAt(LocalDateTime.now());
            Booking savedBooking = bookingRepository.save(prior);
            event.setSeatsLeft(event.getSeatsLeft() - 1);
            eventRepository.save(event);
            log.info("Booking reactivated after cancel: {}", savedBooking.getId());
            if (!paidEvent) {
                registerEntryCode(user, savedBooking.getBookingReference());
            }
            return enrichDto(savedBooking, !paidEvent);
        }

        LocalDateTime now = LocalDateTime.now();
        String entryCode = generateBookingReference();
        Booking booking = Booking.builder()
                .user(user)
                .event(event)
                .bookingReference(entryCode)
                .qrCode(qrCodeService.buildEntryPayload(entryCode))
                .status(paidEvent ? Booking.BookingStatus.PENDING : Booking.BookingStatus.CONFIRMED)
                .paymentStatus(paidEvent ? Booking.PaymentStatus.PENDING : Booking.PaymentStatus.COMPLETED)
                .paymentAmount(event.getFee())
                .createdAt(now)
                .updatedAt(now)
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        event.setSeatsLeft(event.getSeatsLeft() - 1);
        eventRepository.save(event);

        log.info("Booking created successfully: {}", savedBooking.getId());
        if (!paidEvent) {
            registerEntryCode(user, savedBooking.getBookingReference());
        }
        return enrichDto(savedBooking, !paidEvent);
    }

    @Override
    @Transactional
    public BookingDto completePayment(Long id) {
        Booking booking = findOwnedBooking(id);
        if (booking.getPaymentStatus() == Booking.PaymentStatus.COMPLETED) {
            return enrichDto(booking, true);
        }
        booking.setPaymentStatus(Booking.PaymentStatus.COMPLETED);
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);
        registerEntryCode(saved.getUser(), saved.getBookingReference());
        log.info("Payment completed for booking: {}", id);
        return enrichDto(saved, true);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingDto verifyEntryCode(String entryCode) {
        String code = qrCodeService.parseEntryCode(entryCode);
        Booking booking = bookingRepository.findByBookingReference(code)
                .orElseThrow(() -> new RuntimeException(INVALID_ENTRY_CODE));
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("This entry pass has been cancelled");
        }
        if (booking.getPaymentStatus() != Booking.PaymentStatus.COMPLETED) {
            throw new RuntimeException(PAYMENT_REQUIRED);
        }
        return enrichDto(booking, true);
    }

    @Override
    public BookingDto getBookingById(Long id) {
        Booking booking = findOwnedBooking(id);
        boolean showQr = booking.getPaymentStatus() == Booking.PaymentStatus.COMPLETED;
        return enrichDto(booking, showQr);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<BookingDto> getUserBookings(int page, int size) {
        Long userId = SecurityUtils.requireCurrentUserId();
        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookingPage = bookingRepository.findByUserId(userId, pageable);

        return PaginatedResponse.of(
                bookingPage.getContent().stream()
                        .map(b -> enrichDto(b, b.getPaymentStatus() == Booking.PaymentStatus.COMPLETED))
                        .collect(Collectors.toList()),
                bookingPage.getNumber(),
                bookingPage.getSize(),
                bookingPage.getTotalElements()
        );
    }

    @Override
    public PaginatedResponse<BookingDto> getEventAttendees(Long eventId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookingPage = bookingRepository.findByEventId(eventId, pageable);

        return PaginatedResponse.of(
                bookingPage.getContent().stream()
                        .map(b -> enrichDto(b, true))
                        .collect(Collectors.toList()),
                bookingPage.getNumber(),
                bookingPage.getSize(),
                bookingPage.getTotalElements()
        );
    }

    @Override
    @Transactional
    public void cancelBooking(Long id) {
        Booking booking = findOwnedBooking(id);

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking already cancelled");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        Event event = booking.getEvent();
        event.setSeatsLeft(event.getSeatsLeft() + 1);
        eventRepository.save(event);
    }

    @Override
    @Transactional
    public void confirmBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(BOOKING_NOT_FOUND));
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        bookingRepository.save(booking);
    }

    @Override
    @Transactional
    public void markAttended(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(BOOKING_NOT_FOUND));
        booking.setStatus(Booking.BookingStatus.ATTENDED);
        bookingRepository.save(booking);
    }

    private Booking findOwnedBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(BOOKING_NOT_FOUND));
        Long userId = SecurityUtils.requireCurrentUserId();
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException(BOOKING_NOT_FOUND);
        }
        return booking;
    }

    private void applyNewEntryCredentials(Booking booking) {
        String entryCode = generateBookingReference();
        booking.setBookingReference(entryCode);
        booking.setQrCode(qrCodeService.buildEntryPayload(entryCode));
    }

    private BookingDto enrichDto(Booking booking, boolean includeQrImage) {
        BookingDto dto = bookingMapper.toDto(booking);
        if (dto == null) {
            return null;
        }
        dto.setEntryCode(dto.getBookingReference());
        if (booking.getUser() != null) {
            dto.setRollNumber(booking.getUser().getRollNumber());
        }
        if (includeQrImage && dto.getBookingReference() != null) {
            String payload = qrCodeService.buildEntryPayload(dto.getBookingReference());
            dto.setQrCode(payload);
            dto.setQrCodeImage(qrCodeService.generateQrImageBase64(payload));
        }
        return dto;
    }

    private void applyRollNumber(User user, String rollNumber) {
        if (rollNumber != null && !rollNumber.isBlank()) {
            user.setRollNumber(rollNumber.trim());
            userRepository.save(user);
        }
    }

    private void registerEntryCode(User user, String entryCode) {
        if (entryCode == null || entryCode.isBlank()) {
            return;
        }
        if (user.getEntryCodes() == null) {
            user.setEntryCodes(new ArrayList<>());
        }
        if (!user.getEntryCodes().contains(entryCode)) {
            user.getEntryCodes().add(entryCode);
            userRepository.save(user);
        }
    }

    private String generateBookingReference() {
        return "BK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
