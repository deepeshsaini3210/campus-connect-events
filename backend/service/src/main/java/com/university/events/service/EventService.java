package com.university.events.service;

import com.university.events.api.common.PaginatedResponse;
import com.university.events.api.dto.event.CreateEventRequest;
import com.university.events.api.dto.event.EventDto;
import com.university.events.api.dto.event.EventSearchRequest;
import com.university.events.api.dto.event.UpdateEventRequest;
import org.springframework.web.multipart.MultipartFile;

/**
 * Event service interface
 */
public interface EventService {
    
    EventDto createEvent(CreateEventRequest request, MultipartFile image);
    
    EventDto getEventById(Long id);
    
    PaginatedResponse<EventDto> searchEvents(EventSearchRequest searchRequest);

    PaginatedResponse<EventDto> getFeaturedEvents(int page, int size);

    PaginatedResponse<EventDto> getUpcomingEvents(int page, int size);
    
    EventDto updateEvent(Long id, UpdateEventRequest request);
    
    void deleteEvent(Long id);
    
    void approveEvent(Long id);
    
    void rejectEvent(Long id, String reason);
}
