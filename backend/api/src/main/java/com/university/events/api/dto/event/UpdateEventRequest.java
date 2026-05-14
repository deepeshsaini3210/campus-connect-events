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
 * Update Event request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEventRequest {
    
    @Size(min = 5, max = 255, message = "Title must be between 5 and 255 characters")
    private String title;
    
    @Size(min = 20, max = 2000, message = "Description must be between 20 and 2000 characters")
    private String description;
    
    private Long categoryId;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Future(message = "Event date must be in the future")
    private LocalDate eventDate;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime eventTime;
    
    @Size(min = 5, max = 255, message = "Venue must be between 5 and 255 characters")
    private String venue;
    
    @Pattern(regexp = "ONLINE|OFFLINE|HYBRID", message = "Mode must be ONLINE, OFFLINE, or HYBRID")
    private String mode;
    
    @DecimalMin(value = "0.0", inclusive = true, message = "Fee cannot be negative")
    @Digits(integer = 8, fraction = 2, message = "Fee must have maximum 8 integer digits and 2 decimal digits")
    private BigDecimal fee;
    
    @Min(value = 1, message = "Total seats must be at least 1")
    @Max(value = 10000, message = "Total seats cannot exceed 10000")
    private Integer seatsTotal;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Future(message = "Deadline must be in the future")
    private LocalDate deadline;
    
    private Boolean isFeatured;
    private Boolean isPartnerEvent;
    
    @Size(max = 500, message = "Image URL cannot exceed 500 characters")
    private String imageUrl;
    
    @Size(max = 5, message = "Maximum 5 highlights allowed")
    private List<@NotBlank(message = "Highlight cannot be blank") @Size(max = 255, message = "Highlight cannot exceed 255 characters") String> highlights;
}
