package com.university.events.api.dto.event;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Create Event request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateEventRequest {
    
    @NotBlank(message = "Event title is required")
    @Size(min = 5, max = 255, message = "Title must be between 5 and 255 characters")
    private String title;
    
    @NotBlank(message = "Event description is required")
    @Size(min = 20, max = 2000, message = "Description must be between 20 and 2000 characters")
    private String description;
    
    @NotNull(message = "Category is required")
    private Long categoryId;
    
    @NotNull(message = "Event date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Future(message = "Event date must be in the future")
    private LocalDate eventDate;
    
    @NotNull(message = "Event time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime eventTime;
    
    @NotBlank(message = "Venue is required")
    @Size(min = 5, max = 255, message = "Venue must be between 5 and 255 characters")
    private String venue;
    
    @NotBlank(message = "Event mode is required")
    @Pattern(regexp = "ONLINE|OFFLINE|HYBRID", message = "Mode must be ONLINE, OFFLINE, or HYBRID")
    private String mode;
    
    @NotNull(message = "Fee is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Fee cannot be negative")
    @Digits(integer = 8, fraction = 2, message = "Fee must have maximum 8 integer digits and 2 decimal digits")
    private BigDecimal fee;
    
    @NotNull(message = "Total seats is required")
    @Min(value = 1, message = "Total seats must be at least 1")
    @Max(value = 10000, message = "Total seats cannot exceed 10000")
    private Integer seatsTotal;
    
    @NotNull(message = "Registration deadline is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Future(message = "Deadline must be in the future")
    private LocalDate deadline;
    
    private Boolean isFeatured = false;
    private Boolean isPartnerEvent = false;
    
    @Size(max = 500, message = "Image URL cannot exceed 500 characters")
    private String imageUrl;
    
    @Size(max = 5, message = "Maximum 5 highlights allowed")
    private List<@NotBlank(message = "Highlight cannot be blank") @Size(max = 255, message = "Highlight cannot exceed 255 characters") String> highlights;
}
