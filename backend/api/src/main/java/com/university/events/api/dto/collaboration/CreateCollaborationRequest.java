package com.university.events.api.dto.collaboration;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateCollaborationRequest {
    @NotNull
    private Long requesterCollegeId;

    /** Legacy: optional when partnerUniversityName is provided. */
    private Long partnerCollegeId;

    @NotBlank
    @Size(max = 255)
    private String partnerUniversityName;

    @Size(max = 1000)
    private String notes;

    @Size(max = 2000)
    private String specialOffers;

    @NotBlank
    @Size(max = 120)
    private String coordinatorName;

    @NotBlank
    @Size(max = 255)
    private String coordinatorEmail;
}
