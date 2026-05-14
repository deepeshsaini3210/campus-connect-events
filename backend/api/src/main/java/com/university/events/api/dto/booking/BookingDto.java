package com.university.events.api.dto.booking;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Booking DTO for API responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDto {
    
    private Long id;
    private String bookingReference;
    private String qrCode;
    private String status;
    private String paymentStatus;
    private EventSummaryDto event;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventSummaryDto {
        private Long id;
        private String title;
        private String category;
        private String collegeName;
        private String eventDate;
        private String eventTime;
        private String venue;
        private String mode;
        private Double fee;
        private String imageUrl;
    }
}
