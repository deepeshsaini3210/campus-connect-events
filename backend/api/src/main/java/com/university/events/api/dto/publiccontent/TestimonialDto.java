package com.university.events.api.dto.publiccontent;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestimonialDto {
    private Long id;
    private String name;
    private String role;
    private String quote;
}
