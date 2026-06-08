package com.university.events.api.dto.collaboration;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollaborationDto {

    private Long id;
    private CollegeSummaryDto requesterCollege;
    private CollegeSummaryDto partnerCollege;
    private String status;
    private String coordinatorName;
    private String coordinatorEmail;
    private String notes;
    private String specialOffers;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime requestDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime responseDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CollegeSummaryDto {
        private Long id;
        private String name;
        private String code;
    }
}
