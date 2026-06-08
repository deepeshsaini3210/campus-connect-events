package com.university.events.controller;

import com.university.events.api.common.ApiResponse;
import com.university.events.api.dto.publiccontent.CollaborationOfferDto;
import com.university.events.api.dto.publiccontent.PartnerCollegeDto;
import com.university.events.api.dto.publiccontent.TestimonialDto;
import com.university.events.api.entity.Collaboration;
import com.university.events.service.repository.CollaborationRepository;
import com.university.events.service.repository.CollegeRepository;
import com.university.events.service.repository.TestimonialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/public")
@RequiredArgsConstructor
public class PublicContentController {

    private final CollegeRepository collegeRepository;
    private final CollaborationRepository collaborationRepository;
    private final TestimonialRepository testimonialRepository;

    @GetMapping("/partner-colleges")
    public ApiResponse<List<PartnerCollegeDto>> partnerColleges() {
        List<Collaboration> collaborations = collaborationRepository.findAll();
        Map<Long, com.university.events.api.entity.College> collegesById = new java.util.LinkedHashMap<>();
        for (Collaboration c : collaborations) {
            if (c.getPartnerCollege() != null) {
                collegesById.putIfAbsent(c.getPartnerCollege().getId(), c.getPartnerCollege());
            }
            if (c.getRequesterCollege() != null) {
                collegesById.putIfAbsent(c.getRequesterCollege().getId(), c.getRequesterCollege());
            }
        }

        List<PartnerCollegeDto> colleges = collegesById.values().stream()
                .map(c -> PartnerCollegeDto.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .code(c.getCode())
                        .city(c.getCity())
                        .state(c.getState())
                        .logo(c.getLogo())
                        .activeOffers(0L)
                        .build())
                .toList();
        return ApiResponse.success(colleges);
    }

    @GetMapping("/collaboration-offers")
    public ApiResponse<List<CollaborationOfferDto>> offers() {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy");
        List<CollaborationOfferDto> offers = collaborationRepository.findAll().stream()
                .filter(c -> c.getStatus() == Collaboration.CollaborationStatus.APPROVED)
                .filter(c -> c.getSpecialOffers() != null && !c.getSpecialOffers().isBlank())
                .map(c -> CollaborationOfferDto.builder()
                        .collaborationId(c.getId())
                        .college(c.getPartnerCollege().getName())
                        .offer(c.getSpecialOffers())
                        .validity(c.getUpdatedAt() != null ? c.getUpdatedAt().toLocalDate().format(fmt) : "Ongoing")
                        .build())
                .toList();
        return ApiResponse.success(offers);
    }

    @GetMapping("/testimonials")
    public ApiResponse<List<TestimonialDto>> testimonials() {
        List<TestimonialDto> testimonials = testimonialRepository.findByIsFeaturedTrueOrderByDisplayOrderAsc().stream()
                .map(t -> TestimonialDto.builder()
                        .id(t.getId())
                        .name(t.getFullName())
                        .role(t.getRole())
                        .quote(t.getQuote())
                        .build())
                .toList();
        return ApiResponse.success(testimonials);
    }
}
