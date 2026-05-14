package com.university.events.service.mapper;

import com.university.events.api.dto.event.EventDto;
import com.university.events.api.dto.event.CreateEventRequest;
import com.university.events.api.dto.event.UpdateEventRequest;
import com.university.events.api.entity.Event;
import com.university.events.api.entity.EventCategory;
import com.university.events.api.entity.EventHighlight;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Mapper for Event entity and DTOs
 */
@Mapper(componentModel = "spring")
public interface EventMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "organizer", ignore = true)
    @Mapping(target = "college", ignore = true)
    @Mapping(target = "highlights", ignore = true)
    @Mapping(target = "bookings", ignore = true)
    @Mapping(target = "seatsLeft", expression = "java(request.getSeatsTotal())")
    Event toEntity(CreateEventRequest request);
    
    @Mapping(target = "highlights", source = "highlights", qualifiedByName = "mapHighlights")
    EventDto toDto(Event event);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "organizer", ignore = true)
    @Mapping(target = "college", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "highlights", ignore = true)
    @Mapping(target = "bookings", ignore = true)
    @Mapping(target = "seatsLeft", ignore = true)
    void updateEntity(UpdateEventRequest request, @MappingTarget Event event);
    
    @Named("mapHighlights")
    default List<String> mapHighlights(Set<EventHighlight> highlights) {
        if (highlights == null) {
            return null;
        }
        return highlights.stream()
                .sorted((h1, h2) -> Integer.compare(h1.getOrderIndex(), h2.getOrderIndex()))
                .map(EventHighlight::getHighlightText)
                .collect(Collectors.toList());
    }
    
    @Named("mapEventCategory")
    default EventDto.EventCategoryDto mapEventCategory(EventCategory category) {
        if (category == null) {
            return null;
        }
        return EventDto.EventCategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .color(category.getColor())
                .icon(category.getIcon())
                .build();
    }
    
    @Named("mapOrganizer")
    default EventDto.OrganizerDto mapOrganizer(com.university.events.api.entity.User organizer) {
        if (organizer == null) {
            return null;
        }
        return EventDto.OrganizerDto.builder()
                .id(organizer.getId())
                .firstName(organizer.getFirstName())
                .lastName(organizer.getLastName())
                .email(organizer.getEmail())
                .build();
    }
    
    @Named("mapCollege")
    default EventDto.CollegeDto mapCollege(com.university.events.api.entity.College college) {
        if (college == null) {
            return null;
        }
        return EventDto.CollegeDto.builder()
                .id(college.getId())
                .name(college.getName())
                .code(college.getCode())
                .city(college.getCity())
                .state(college.getState())
                .logo(college.getLogo())
                .build();
    }
}
