package com.university.events.api.dto.collaboration;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateCollaborationRequest {
    @NotNull
    private Long requesterCollegeId;

    @NotNull
    private Long partnerCollegeId;

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
