package com.university.events.controller;

import com.university.events.api.common.ApiResponse;
import com.university.events.api.common.PaginatedResponse;
import com.university.events.api.dto.event.CreateEventRequest;
import com.university.events.api.dto.event.EventDto;
import com.university.events.api.dto.event.EventSearchRequest;
import com.university.events.api.dto.event.UpdateEventRequest;
import com.university.events.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Event management controller
 */
@RestController
@RequestMapping("/v1/events")
@RequiredArgsConstructor
@Tag(name = "Events", description = "Event management APIs")
public class EventController {
    
    private final EventService eventService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('EVENT_ORGANIZER', 'COLLEGE_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Create a new event", description = "Create a new event with details")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Event created successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    public ResponseEntity<ApiResponse<EventDto>> createEvent(@Valid @RequestBody CreateEventRequest request) {
        EventDto event = eventService.createEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(event));
    }
    
    @GetMapping
    @Operation(summary = "Search events", description = "Search and filter events with pagination")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Events retrieved successfully")
    })
    public ResponseEntity<ApiResponse<PaginatedResponse<EventDto>>> searchEvents(EventSearchRequest searchRequest) {
        PaginatedResponse<EventDto> events = eventService.searchEvents(searchRequest);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured events", description = "Approved featured events with event date on or after today")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Featured events retrieved successfully")
    })
    public ResponseEntity<ApiResponse<PaginatedResponse<EventDto>>> getFeaturedEvents(
            @Parameter(description = "Page number") @RequestParam(value = "page", defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {
        PaginatedResponse<EventDto> events = eventService.getFeaturedEvents(page, size);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming events", description = "Approved events with event date on or after today, soonest first")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Upcoming events retrieved successfully")
    })
    public ResponseEntity<ApiResponse<PaginatedResponse<EventDto>>> getUpcomingEvents(
            @Parameter(description = "Page number") @RequestParam(value = "page", defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(value = "size", defaultValue = "20") int size) {
        PaginatedResponse<EventDto> events = eventService.getUpcomingEvents(page, size);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get event by ID", description = "Retrieve event details by ID")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Event retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Event not found")
    })
    public ResponseEntity<ApiResponse<EventDto>> getEventById(@Parameter(description = "Event ID") @PathVariable Long id) {
        EventDto event = eventService.getEventById(id);
        return ResponseEntity.ok(ApiResponse.success(event));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EVENT_ORGANIZER', 'COLLEGE_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Update event", description = "Update existing event details")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Event updated successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Event not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    public ResponseEntity<ApiResponse<EventDto>> updateEvent(
            @Parameter(description = "Event ID") @PathVariable Long id,
            @Valid @RequestBody UpdateEventRequest request) {
        EventDto event = eventService.updateEvent(id, request);
        return ResponseEntity.ok(ApiResponse.success(event));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EVENT_ORGANIZER', 'COLLEGE_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Delete event", description = "Delete an existing event")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Event deleted successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Event not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@Parameter(description = "Event ID") @PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Event deleted successfully"));
    }
    
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('COLLEGE_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Approve event", description = "Approve an event for publishing")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Event approved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Event not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    public ResponseEntity<ApiResponse<Void>> approveEvent(@Parameter(description = "Event ID") @PathVariable Long id) {
        eventService.approveEvent(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Event approved successfully"));
    }
    
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('COLLEGE_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Reject event", description = "Reject an event")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Event rejected successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Event not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    public ResponseEntity<ApiResponse<Void>> rejectEvent(
            @Parameter(description = "Event ID") @PathVariable Long id,
            @Parameter(description = "Rejection reason") @RequestParam("reason") String reason) {
        eventService.rejectEvent(id, reason);
        return ResponseEntity.ok(ApiResponse.success(null, "Event rejected successfully"));
    }
}
