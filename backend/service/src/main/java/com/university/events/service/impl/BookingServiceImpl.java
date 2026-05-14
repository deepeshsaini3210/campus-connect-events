package com.university.events.service.impl;

import com.university.events.api.common.PaginatedResponse;
import com.university.events.api.dto.booking.BookingDto;
import com.university.events.api.dto.booking.CreateBookingRequest;
import com.university.events.api.entity.Booking;
import com.university.events.api.entity.Event;
import com.university.events.api.entity.User;
import com.university.events.service.BookingService;
import com.university.events.service.mapper.BookingMapper;
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
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Booking service implementation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {
    
    private static final String BOOKING_NOT_FOUND = "Booking not found";
    private static final String EVENT_NOT_FOUND = "Event not found";
    private static final String USER_NOT_FOUND = "User not found";
    private static final String NO_SEATS_AVAILABLE = "No seats available for this event";
    private static final String ALREADY_BOOKED = "Already booked for this event";
    private static final String BOOKING_CANCELLED = "Booking cancelled successfully";
    private static final String BOOKING_CONFIRMED = "Booking confirmed successfully";
    private static final String BOOKING_ATTENDED = "Booking marked as attended";
    
    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;
    
    @Override
    @Transactional
    public BookingDto createBooking(CreateBookingRequest request) {
        log.info("Creating booking for event: {}", request.getEventId());
        
        // Get event
        Event event = eventRepository.findActiveEventById(request.getEventId())
                .orElseThrow(() -> new RuntimeException(EVENT_NOT_FOUND));
        
        // Check if seats are available
        if (event.getSeatsLeft() <= 0) {
            throw new RuntimeException(NO_SEATS_AVAILABLE);
        }
        
        // Get current user from security context
        User user = userRepository.findById(SecurityUtils.requireCurrentUserId())
                .orElseThrow(() -> new RuntimeException(USER_NOT_FOUND));
        
        // Check if already booked
        if (bookingRepository.existsByUserIdAndEventId(user.getId(), event.getId())) {
            throw new RuntimeException(ALREADY_BOOKED);
        }
        
        // Create booking
        Booking booking = Booking.builder()
                .user(user)
                .event(event)
                .bookingReference(generateBookingReference())
                .qrCode(generateQRCode())
                .status(Booking.BookingStatus.PENDING)
                .paymentStatus(event.getFee().doubleValue() > 0 ? 
                        Booking.PaymentStatus.PENDING : Booking.PaymentStatus.COMPLETED)
                .paymentAmount(event.getFee())
                .build();
        
        // Save booking
        Booking savedBooking = bookingRepository.save(booking);
        
        // Update seats left
        event.setSeatsLeft(event.getSeatsLeft() - 1);
        eventRepository.save(event);
        
        log.info("Booking created successfully: {}", savedBooking.getId());
        return bookingMapper.toDto(savedBooking);
    }
    
    @Override
    public BookingDto getBookingById(Long id) {
        log.info("Getting booking by ID: {}", id);
        
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(BOOKING_NOT_FOUND));
        
        return bookingMapper.toDto(booking);
    }
    
    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<BookingDto> getUserBookings(int page, int size) {
        log.info("Getting bookings for user");

        Long userId = SecurityUtils.requireCurrentUserId();

        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookingPage = bookingRepository.findByUserId(userId, pageable);

        return PaginatedResponse.of(
                bookingPage.getContent().stream()
                        .map(bookingMapper::toDto)
                        .collect(Collectors.toList()),
                bookingPage.getNumber(),
                bookingPage.getSize(),
                bookingPage.getTotalElements()
        );
    }
    
    @Override
    public PaginatedResponse<BookingDto> getEventAttendees(Long eventId, int page, int size) {
        log.info("Getting attendees for event: {}", eventId);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookingPage = bookingRepository.findByEventId(eventId, pageable);
        
        return PaginatedResponse.of(
                bookingPage.getContent().stream()
                        .map(bookingMapper::toDto)
                        .collect(Collectors.toList()),
                bookingPage.getNumber(),
                bookingPage.getSize(),
                bookingPage.getTotalElements()
        );
    }
    
    @Override
    @Transactional
    public void cancelBooking(Long id) {
        log.info("Cancelling booking: {}", id);
        
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(BOOKING_NOT_FOUND));
        
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking already cancelled");
        }
        
        // Update booking status
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        
        // Update seats left
        Event event = booking.getEvent();
        event.setSeatsLeft(event.getSeatsLeft() + 1);
        eventRepository.save(event);
        
        log.info(BOOKING_CANCELLED);
    }
    
    @Override
    @Transactional
    public void confirmBooking(Long id) {
        log.info("Confirming booking: {}", id);
        
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(BOOKING_NOT_FOUND));
        
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        bookingRepository.save(booking);
        
        log.info(BOOKING_CONFIRMED);
    }
    
    @Override
    @Transactional
    public void markAttended(Long id) {
        log.info("Marking booking as attended: {}", id);
        
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(BOOKING_NOT_FOUND));
        
        booking.setStatus(Booking.BookingStatus.ATTENDED);
        bookingRepository.save(booking);
        
        log.info(BOOKING_ATTENDED);
    }
    
    private String generateBookingReference() {
        return "BK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    private String generateQRCode() {
        // TODO: Implement actual QR code generation
        return "QR_" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    }
}
