package com.university.events.service.impl;

import com.university.events.api.common.PaginatedResponse;
import com.university.events.api.dto.event.CreateEventRequest;
import com.university.events.api.dto.event.EventDto;
import com.university.events.api.dto.event.EventSearchRequest;
import com.university.events.api.dto.event.UpdateEventRequest;
import com.university.events.api.entity.*;
import com.university.events.service.EventService;
import com.university.events.service.mapper.EventMapper;
import com.university.events.service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.university.events.service.security.UserPrincipal;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Event service implementation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EventServiceImpl implements EventService {
    
    private static final String EVENT_NOT_FOUND = "Event not found";
    private static final String CATEGORY_NOT_FOUND = "Category not found";
    private static final String ORGANIZER_NOT_FOUND = "Organizer not found";
    private static final String COLLEGE_NOT_FOUND = "College not found";
    
    private final EventRepository eventRepository;
    private final EventCategoryRepository categoryRepository;
    private final CollegeRepository collegeRepository;
    private final UserRepository userRepository;
    private final EventHighlightRepository highlightRepository;
    private final EventMapper eventMapper;

    private static final String NOT_AUTHENTICATED = "User is not authenticated";

    private User resolveCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new RuntimeException(NOT_AUTHENTICATED);
        }
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException(ORGANIZER_NOT_FOUND));
    }
    
    @Override
    @Transactional
    public EventDto createEvent(CreateEventRequest request) {
        log.info("Creating new event: {}", request.getTitle());
        
        // Validate category
        EventCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException(CATEGORY_NOT_FOUND));
        
        // Current user from JWT / security context
        User organizer = resolveCurrentUser();

        // Host college for the event
        College college = collegeRepository
                .findById(organizer.getCollege() != null ? organizer.getCollege().getId() : 1L)
                .orElseThrow(() -> new RuntimeException(COLLEGE_NOT_FOUND));
        
        // Create event
        Event event = eventMapper.toEntity(request);
        event.setCategory(category);
        event.setOrganizer(organizer);
        event.setCollege(college);
        
        // Save event
        Event savedEvent = eventRepository.save(event);
        
        // Add highlights if provided
        if (request.getHighlights() != null && !request.getHighlights().isEmpty()) {
            List<EventHighlight> highlights = new ArrayList<>();
            for (int i = 0; i < request.getHighlights().size(); i++) {
                EventHighlight highlight = EventHighlight.builder()
                        .event(savedEvent)
                        .highlightText(request.getHighlights().get(i))
                        .orderIndex(i)
                        .build();
                highlights.add(highlight);
            }
            highlightRepository.saveAll(highlights);
        }
        
        log.info("Event created successfully: {}", savedEvent.getId());
        return eventMapper.toDto(savedEvent);
    }
    
    @Override
    @Transactional(readOnly = true)
    public EventDto getEventById(Long id) {
        log.info("Getting event by ID: {}", id);
        
        Event event = eventRepository.findActiveEventById(id)
                .orElseThrow(() -> new RuntimeException(EVENT_NOT_FOUND));
        
        return eventMapper.toDto(event);
    }
    
    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<EventDto> searchEvents(EventSearchRequest searchRequest) {
        log.info("Searching events with criteria: {}", searchRequest);
        
        // Create sort
        Sort sort = Sort.by(Sort.Direction.fromString(searchRequest.getSortDir()), searchRequest.getSortBy());
        
        // Create pageable
        Pageable pageable = PageRequest.of(searchRequest.getPage(), searchRequest.getSize(), sort);

        Event.EventMode modeFilter = parseModeOrNull(searchRequest.getMode());
        Event.EventStatus statusFilter = parseStatusOrNull(searchRequest.getStatus());

        // Search events
        Page<Event> eventPage = eventRepository.searchEvents(
                searchRequest.getKeyword(),
                searchRequest.getCategoryId(),
                searchRequest.getCollegeId(),
                modeFilter,
                statusFilter,
                searchRequest.getIsFeatured(),
                searchRequest.getIsPartnerEvent(),
                searchRequest.getFreeOnly(),
                searchRequest.getPaidOnly(),
                pageable
        );
        
        // Convert to DTOs
        List<EventDto> eventDtos = eventPage.getContent().stream()
                .map(eventMapper::toDto)
                .collect(Collectors.toList());
        
        return PaginatedResponse.of(eventDtos, eventPage.getNumber(), eventPage.getSize(), eventPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<EventDto> getFeaturedEvents(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "eventDate"));
        Page<Event> eventPage = eventRepository.findFeaturedEvents(LocalDate.now(), pageable);
        List<EventDto> eventDtos = eventPage.getContent().stream()
                .map(eventMapper::toDto)
                .collect(Collectors.toList());
        return PaginatedResponse.of(eventDtos, eventPage.getNumber(), eventPage.getSize(), eventPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<EventDto> getUpcomingEvents(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "eventDate"));
        Page<Event> eventPage = eventRepository.findUpcomingEvents(LocalDate.now(), pageable);
        List<EventDto> eventDtos = eventPage.getContent().stream()
                .map(eventMapper::toDto)
                .collect(Collectors.toList());
        return PaginatedResponse.of(eventDtos, eventPage.getNumber(), eventPage.getSize(), eventPage.getTotalElements());
    }
    
    @Override
    @Transactional
    public EventDto updateEvent(Long id, UpdateEventRequest request) {
        log.info("Updating event: {}", id);
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(EVENT_NOT_FOUND));
        
        // Check permissions - only organizer or admin can update
        // TODO: Implement proper security check
        
        // Update event
        eventMapper.updateEntity(request, event);
        
        // Update category if provided
        if (request.getCategoryId() != null) {
            EventCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException(CATEGORY_NOT_FOUND));
            event.setCategory(category);
        }
        
        // Update highlights if provided
        if (request.getHighlights() != null) {
            // Remove existing highlights
            highlightRepository.deleteByEventId(id);
            
            // Add new highlights
            if (!request.getHighlights().isEmpty()) {
                List<EventHighlight> highlights = new ArrayList<>();
                for (int i = 0; i < request.getHighlights().size(); i++) {
                    EventHighlight highlight = EventHighlight.builder()
                            .event(event)
                            .highlightText(request.getHighlights().get(i))
                            .orderIndex(i)
                            .build();
                    highlights.add(highlight);
                }
                highlightRepository.saveAll(highlights);
            }
        }
        
        Event updatedEvent = eventRepository.save(event);
        log.info("Event updated successfully: {}", updatedEvent.getId());
        
        return eventMapper.toDto(updatedEvent);
    }
    
    @Override
    @Transactional
    public void deleteEvent(Long id) {
        log.info("Deleting event: {}", id);
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(EVENT_NOT_FOUND));
        
        // Check permissions
        // TODO: Implement proper security check
        
        // Delete event
        eventRepository.delete(event);
        
        log.info("Event deleted successfully: {}", id);
    }
    
    @Override
    @Transactional
    public void approveEvent(Long id) {
        log.info("Approving event: {}", id);
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(EVENT_NOT_FOUND));
        
        event.setStatus(Event.EventStatus.APPROVED);
        eventRepository.save(event);
        
        log.info("Event approved successfully: {}", id);
    }
    
    @Override
    @Transactional
    public void rejectEvent(Long id, String reason) {
        log.info("Rejecting event: {} with reason: {}", id, reason);
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(EVENT_NOT_FOUND));
        
        event.setStatus(Event.EventStatus.REJECTED);
        eventRepository.save(event);
        
        log.info("Event rejected successfully: {}", id);
    }

    private static Event.EventMode parseModeOrNull(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return Event.EventMode.valueOf(raw.trim());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Invalid mode filter (use ONLINE, OFFLINE, or HYBRID): " + raw);
        }
    }

    private static Event.EventStatus parseStatusOrNull(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return Event.EventStatus.valueOf(raw.trim());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid status filter: " + raw);
        }
    }
}
