package com.university.events.api.dto.event;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Event DTO for API responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventDto {
    
    private Long id;
    private String title;
    private String description;
    private EventCategoryDto category;
    private OrganizerDto organizer;
    private CollegeDto college;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate eventDate;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime eventTime;
    
    private String venue;
    private String mode;
    private BigDecimal fee;
    private Integer seatsTotal;
    private Integer seatsLeft;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate deadline;
    
    private String status;
    private Boolean isFeatured;
    private Boolean isPartnerEvent;
    private String imageUrl;
    private List<String> highlights;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventCategoryDto {
        private Long id;
        private String name;
        private String description;
        private String color;
        private String icon;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrganizerDto {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CollegeDto {
        private Long id;
        private String name;
        private String code;
        private String city;
        private String state;
        private String logo;
    }
}
