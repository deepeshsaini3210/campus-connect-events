package com.university.events.service;

import com.university.events.api.common.PaginatedResponse;
import com.university.events.api.dto.booking.BookingDto;
import com.university.events.api.dto.booking.CreateBookingRequest;

/**
 * Booking service interface
 */
public interface BookingService {
    
    BookingDto createBooking(CreateBookingRequest request);
    
    BookingDto getBookingById(Long id);
    
    PaginatedResponse<BookingDto> getUserBookings(int page, int size);
    
    PaginatedResponse<BookingDto> getEventAttendees(Long eventId, int page, int size);
    
    void cancelBooking(Long id);
    
    void confirmBooking(Long id);

    BookingDto completePayment(Long id);

    BookingDto verifyEntryCode(String entryCode);
    
    void markAttended(Long id);
}
