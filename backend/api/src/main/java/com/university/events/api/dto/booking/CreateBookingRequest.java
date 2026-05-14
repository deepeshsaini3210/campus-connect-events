package com.university.events.api.dto.booking;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Create Booking request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {
    
    @NotNull(message = "Event ID is required")
    private Long eventId;
}
