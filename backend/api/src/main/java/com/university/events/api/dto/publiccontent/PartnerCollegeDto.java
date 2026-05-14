package com.university.events.api.dto.publiccontent;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnerCollegeDto {
    private Long id;
    private String name;
    private String code;
    private String city;
    private String state;
    private String logo;
    private long activeOffers;
}
