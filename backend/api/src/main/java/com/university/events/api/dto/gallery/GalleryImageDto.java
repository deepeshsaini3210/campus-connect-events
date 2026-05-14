package com.university.events.api.dto.gallery;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GalleryImageDto {
    private Long id;
    private String title;
    private String description;
    private Long eventId;
    private String eventTitle;
    /** Venue from linked event, when present */
    private String eventVenue;
    private String imageUrl;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate eventDate;

    private String category;
    private Boolean isFeatured;
}
