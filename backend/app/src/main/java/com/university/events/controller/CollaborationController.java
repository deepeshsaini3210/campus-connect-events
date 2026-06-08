package com.university.events.controller;

import com.university.events.api.common.ApiResponse;
import com.university.events.api.common.PaginatedResponse;
import com.university.events.api.dto.collaboration.CollaborationDto;
import com.university.events.api.dto.collaboration.CreateCollaborationRequest;
import com.university.events.api.entity.Collaboration;
import com.university.events.service.CollaborationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/collaborations")
@RequiredArgsConstructor
@Tag(name = "Collaborations", description = "College collaboration request APIs")
public class CollaborationController {

    private final CollaborationService collaborationService;

    @PostMapping("/requests")
    @Operation(summary = "Submit collaboration request", description = "Create a new partnership request between colleges")
    public ResponseEntity<ApiResponse<CollaborationDto>> createRequest(@Valid @RequestBody CreateCollaborationRequest request) {
        CollaborationDto created = collaborationService.createRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(created));
    }

    @GetMapping("/requests")
    @PreAuthorize("hasAnyRole('COLLEGE_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "List collaboration requests", description = "Retrieve collaboration requests for admin review")
    public ResponseEntity<ApiResponse<PaginatedResponse<CollaborationDto>>> getRequests(
            @Parameter(description = "Filter by status") @RequestParam(value = "status", required = false) Collaboration.CollaborationStatus status,
            @Parameter(description = "Page number") @RequestParam(value = "page", defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {
        PaginatedResponse<CollaborationDto> requests = collaborationService.getRequests(status, page, size);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @GetMapping("/requests/{id}")
    @PreAuthorize("hasAnyRole('COLLEGE_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get collaboration request", description = "Retrieve a single collaboration request by ID")
    public ResponseEntity<ApiResponse<CollaborationDto>> getRequestById(@PathVariable Long id) {
        CollaborationDto request = collaborationService.getRequestById(id);
        return ResponseEntity.ok(ApiResponse.success(request));
    }

    @PostMapping("/requests/{id}/approve")
    @PreAuthorize("hasAnyRole('COLLEGE_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Approve collaboration request", description = "Approve a pending collaboration request")
    public ResponseEntity<ApiResponse<CollaborationDto>> approveRequest(@PathVariable Long id) {
        CollaborationDto approved = collaborationService.approveRequest(id);
        return ResponseEntity.ok(ApiResponse.success(approved, "Collaboration request approved"));
    }

    @PostMapping("/requests/{id}/reject")
    @PreAuthorize("hasAnyRole('COLLEGE_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Reject collaboration request", description = "Reject a pending collaboration request")
    public ResponseEntity<ApiResponse<CollaborationDto>> rejectRequest(
            @PathVariable Long id,
            @Parameter(description = "Optional rejection reason") @RequestParam(value = "reason", required = false) String reason) {
        CollaborationDto rejected = collaborationService.rejectRequest(id, reason);
        return ResponseEntity.ok(ApiResponse.success(rejected, "Collaboration request rejected"));
    }
}
