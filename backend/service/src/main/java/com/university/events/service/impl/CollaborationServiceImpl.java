package com.university.events.service.impl;

import com.university.events.api.common.PaginatedResponse;
import com.university.events.api.dto.collaboration.CollaborationDto;
import com.university.events.api.dto.collaboration.CreateCollaborationRequest;
import com.university.events.api.entity.College;
import com.university.events.api.entity.Collaboration;
import com.university.events.service.CollaborationService;
import com.university.events.service.mapper.CollaborationMapper;
import com.university.events.service.repository.CollaborationRepository;
import com.university.events.service.repository.CollegeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CollaborationServiceImpl implements CollaborationService {

    private static final String REQUEST_NOT_FOUND = "Collaboration request not found";
    private static final String REQUESTER_COLLEGE_NOT_FOUND = "Requester college not found";
    private static final String PARTNER_COLLEGE_NOT_FOUND = "Partner college not found";
    private static final String SAME_COLLEGE = "Requester and partner college must be different";
    private static final String NOT_PENDING = "Only pending requests can be updated";

    private final CollaborationRepository collaborationRepository;
    private final CollegeRepository collegeRepository;
    private final CollaborationMapper collaborationMapper;

    @Override
    @Transactional
    public CollaborationDto createRequest(CreateCollaborationRequest request) {
        College requester = collegeRepository.findById(request.getRequesterCollegeId())
                .orElseThrow(() -> new RuntimeException(REQUESTER_COLLEGE_NOT_FOUND));
        College partner = resolvePartnerCollege(request);
        if (requester.getId().equals(partner.getId())) {
            throw new RuntimeException(SAME_COLLEGE);
        }

        Collaboration collaboration = Collaboration.builder()
                .requesterCollege(requester)
                .partnerCollege(partner)
                .status(Collaboration.CollaborationStatus.PENDING)
                .notes(buildNotes(request))
                .specialOffers(request.getSpecialOffers())
                .requestDate(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Collaboration saved = collaborationRepository.save(collaboration);
        log.info("Collaboration request created: {}", saved.getId());
        return collaborationMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<CollaborationDto> getRequests(Collaboration.CollaborationStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "requestDate"));
        Page<Collaboration> requestPage = status != null
                ? collaborationRepository.findByStatus(status, pageable)
                : collaborationRepository.findAll(pageable);

        return PaginatedResponse.of(
                requestPage.getContent().stream()
                        .map(collaborationMapper::toDto)
                        .collect(Collectors.toList()),
                requestPage.getNumber(),
                requestPage.getSize(),
                requestPage.getTotalElements()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public CollaborationDto getRequestById(Long id) {
        Collaboration collaboration = collaborationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(REQUEST_NOT_FOUND));
        return collaborationMapper.toDto(collaboration);
    }

    @Override
    @Transactional
    public CollaborationDto approveRequest(Long id) {
        Collaboration collaboration = findPendingRequest(id);
        collaboration.setStatus(Collaboration.CollaborationStatus.APPROVED);
        collaboration.setResponseDate(LocalDateTime.now());
        collaboration.setUpdatedAt(LocalDateTime.now());
        Collaboration saved = collaborationRepository.save(collaboration);
        log.info("Collaboration request approved: {}", id);
        return collaborationMapper.toDto(saved);
    }

    @Override
    @Transactional
    public CollaborationDto rejectRequest(Long id, String reason) {
        Collaboration collaboration = findPendingRequest(id);
        collaboration.setStatus(Collaboration.CollaborationStatus.REJECTED);
        collaboration.setResponseDate(LocalDateTime.now());
        collaboration.setUpdatedAt(LocalDateTime.now());
        if (reason != null && !reason.isBlank()) {
            String existingNotes = collaboration.getNotes() != null ? collaboration.getNotes() : "";
            collaboration.setNotes(existingNotes + "\n\nRejection reason: " + reason.trim());
        }
        Collaboration saved = collaborationRepository.save(collaboration);
        log.info("Collaboration request rejected: {}", id);
        return collaborationMapper.toDto(saved);
    }

    private Collaboration findPendingRequest(Long id) {
        Collaboration collaboration = collaborationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(REQUEST_NOT_FOUND));
        if (collaboration.getStatus() != Collaboration.CollaborationStatus.PENDING) {
            throw new RuntimeException(NOT_PENDING);
        }
        return collaboration;
    }

    private College resolvePartnerCollege(CreateCollaborationRequest request) {
        if (request.getPartnerCollegeId() != null) {
            return collegeRepository.findById(request.getPartnerCollegeId())
                    .orElseThrow(() -> new RuntimeException(PARTNER_COLLEGE_NOT_FOUND));
        }
        String name = request.getPartnerUniversityName() != null ? request.getPartnerUniversityName().trim() : "";
        if (name.isBlank()) {
            throw new RuntimeException("Partner university name is required");
        }
        return collegeRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> createPartnerCollege(name));
    }

    private College createPartnerCollege(String name) {
        String alphanumeric = name.replaceAll("[^A-Za-z0-9]", "");
        String baseCode = alphanumeric.isEmpty()
                ? "PARTNER"
                : alphanumeric.substring(0, Math.min(8, alphanumeric.length())).toUpperCase(Locale.ROOT);
        String code = baseCode;
        int suffix = 1;
        while (collegeRepository.existsByCode(code)) {
            code = baseCode + suffix++;
        }
        LocalDateTime now = LocalDateTime.now();
        College college = College.builder()
                .name(name)
                .code(code)
                .type(College.CollegeType.INSTITUTE)
                .country("India")
                .isActive(true)
                .createdAt(now)
                .updatedAt(now)
                .build();
        return collegeRepository.save(college);
    }

    private String buildNotes(CreateCollaborationRequest request) {
        String partnerLine = request.getPartnerUniversityName() != null && !request.getPartnerUniversityName().isBlank()
                ? "Partner university: " + request.getPartnerUniversityName().trim() + "\n"
                : "";
        return partnerLine
                + "Coordinator: " + request.getCoordinatorName() + " (" + request.getCoordinatorEmail() + ")\n"
                + (request.getNotes() != null ? request.getNotes() : "");
    }
}
