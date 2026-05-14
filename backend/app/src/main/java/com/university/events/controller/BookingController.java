package com.university.events.controller;

import com.university.events.api.common.ApiResponse;
import com.university.events.api.common.PaginatedResponse;
import com.university.events.api.dto.booking.BookingDto;
import com.university.events.api.dto.booking.CreateBookingRequest;
import com.university.events.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Booking management controller
 */
@RestController
@RequestMapping("/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Event booking and registration APIs")
public class BookingController {
    
    private final BookingService bookingService;
    
    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Create booking", description = "Register for an event")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Booking created successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request or event not available"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Already booked for this event")
    })
    public ResponseEntity<ApiResponse<BookingDto>> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        BookingDto booking = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(booking));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get booking by ID", description = "Retrieve booking details")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Booking retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<ApiResponse<BookingDto>> getBookingById(@Parameter(description = "Booking ID") @PathVariable Long id) {
        BookingDto booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(ApiResponse.success(booking));
    }
    
    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get user bookings", description = "Retrieve current user's bookings")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Bookings retrieved successfully")
    })
    public ResponseEntity<ApiResponse<PaginatedResponse<BookingDto>>> getMyBookings(
            @Parameter(description = "Page number") @RequestParam(value = "page", defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {
        PaginatedResponse<BookingDto> bookings = bookingService.getUserBookings(page, size);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }
    
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Cancel booking", description = "Cancel an existing booking")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Booking cancelled successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Cannot cancel booking")
    })
    public ResponseEntity<ApiResponse<Void>> cancelBooking(@Parameter(description = "Booking ID") @PathVariable Long id) {
        bookingService.cancelBooking(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Booking cancelled successfully"));
    }
    
    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('EVENT_ORGANIZER', 'COLLEGE_ADMIN')")
    @Operation(summary = "Confirm booking", description = "Confirm a pending booking")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Booking confirmed successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<ApiResponse<Void>> confirmBooking(@Parameter(description = "Booking ID") @PathVariable Long id) {
        bookingService.confirmBooking(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Booking confirmed successfully"));
    }
    
    @PostMapping("/{id}/mark-attended")
    @PreAuthorize("hasAnyRole('EVENT_ORGANIZER', 'COLLEGE_ADMIN')")
    @Operation(summary = "Mark booking as attended", description = "Mark a booking as attended")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Booking marked as attended"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking not found")
    })
    public ResponseEntity<ApiResponse<Void>> markAttended(@Parameter(description = "Booking ID") @PathVariable Long id) {
        bookingService.markAttended(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Booking marked as attended"));
    }
    
    @GetMapping("/event/{eventId}/attendees")
    @PreAuthorize("hasAnyRole('EVENT_ORGANIZER', 'COLLEGE_ADMIN')")
    @Operation(summary = "Get event attendees", description = "Retrieve all attendees for an event")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Attendees retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Event not found")
    })
    public ResponseEntity<ApiResponse<PaginatedResponse<BookingDto>>> getEventAttendees(
            @Parameter(description = "Event ID") @PathVariable Long eventId,
            @Parameter(description = "Page number") @RequestParam(value = "page", defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {
        PaginatedResponse<BookingDto> attendees = bookingService.getEventAttendees(eventId, page, size);
        return ResponseEntity.ok(ApiResponse.success(attendees));
    }
}
