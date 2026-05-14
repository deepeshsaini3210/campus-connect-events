package com.university.events.controller;

import com.university.events.api.common.ApiResponse;
import com.university.events.api.dto.collaboration.CreateCollaborationRequest;
import com.university.events.api.entity.Collaboration;
import com.university.events.api.entity.College;
import com.university.events.service.repository.CollaborationRepository;
import com.university.events.service.repository.CollegeRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/v1/collaborations")
@RequiredArgsConstructor
public class CollaborationController {

    private final CollaborationRepository collaborationRepository;
    private final CollegeRepository collegeRepository;

    @PostMapping("/requests")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createRequest(@Valid @RequestBody CreateCollaborationRequest request) {
        College requester = collegeRepository.findById(request.getRequesterCollegeId())
                .orElseThrow(() -> new RuntimeException("Requester college not found"));
        College partner = collegeRepository.findById(request.getPartnerCollegeId())
                .orElseThrow(() -> new RuntimeException("Partner college not found"));

        Collaboration collaboration = Collaboration.builder()
                .requesterCollege(requester)
                .partnerCollege(partner)
                .status(Collaboration.CollaborationStatus.PENDING)
                .notes("Coordinator: " + request.getCoordinatorName() + " (" + request.getCoordinatorEmail() + ")\n"
                        + (request.getNotes() != null ? request.getNotes() : ""))
                .specialOffers(request.getSpecialOffers())
                .requestDate(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Collaboration saved = collaborationRepository.save(collaboration);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(Map.of("requestId", saved.getId(), "status", saved.getStatus().name())));
    }
}
