package com.university.events.service;

import com.university.events.api.common.PaginatedResponse;
import com.university.events.api.dto.collaboration.CollaborationDto;
import com.university.events.api.dto.collaboration.CreateCollaborationRequest;
import com.university.events.api.entity.Collaboration;

public interface CollaborationService {

    CollaborationDto createRequest(CreateCollaborationRequest request);

    PaginatedResponse<CollaborationDto> getRequests(Collaboration.CollaborationStatus status, int page, int size);

    CollaborationDto getRequestById(Long id);

    CollaborationDto approveRequest(Long id);

    CollaborationDto rejectRequest(Long id, String reason);
}
