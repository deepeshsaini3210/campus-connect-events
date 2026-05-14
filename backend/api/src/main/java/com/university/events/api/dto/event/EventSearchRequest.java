package com.university.events.api.dto.event;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event search/filter request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventSearchRequest {
    
    private String keyword;
    private Long categoryId;
    private Long collegeId;
    private String mode;
    private String status;
    private Boolean isFeatured;
    private Boolean isPartnerEvent;
    private Boolean freeOnly;
    private Boolean paidOnly;

    @Min(value = 0, message = "Page number cannot be negative")
    private Integer page = 0;
    
    @Min(value = 1, message = "Page size must be at least 1")
    private Integer size = 20;
    
    private String sortBy = "eventDate";
    private String sortDir = "asc";
}
