package com.university.events.api.dto.gallery;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateGalleryImageRequest {
    @NotBlank
    @Size(max = 255)
    private String title;

    @Size(max = 2000)
    private String description;

    private Long eventId;

    @NotBlank
    @Size(max = 500)
    private String imageUrl;

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate eventDate;

    @NotBlank
    @Size(max = 100)
    private String category;

    private Boolean isFeatured = false;
}
