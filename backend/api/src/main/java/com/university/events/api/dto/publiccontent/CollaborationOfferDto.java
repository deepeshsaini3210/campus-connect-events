package com.university.events.api.dto.publiccontent;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollaborationOfferDto {
    private Long collaborationId;
    private String college;
    private String offer;
    private String validity;
}
