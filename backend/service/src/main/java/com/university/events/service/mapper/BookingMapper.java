package com.university.events.service.mapper;

import com.university.events.api.dto.booking.BookingDto;
import com.university.events.api.entity.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

/**
 * Mapper for Booking entity and DTOs
 */
@Mapper(componentModel = "spring")
public interface BookingMapper {
    
    @Mapping(target = "event", source = "event", qualifiedByName = "mapEventSummary")
    BookingDto toDto(Booking booking);
    
    @Named("mapEventSummary")
    default BookingDto.EventSummaryDto mapEventSummary(com.university.events.api.entity.Event event) {
        if (event == null) {
            return null;
        }
        
        return BookingDto.EventSummaryDto.builder()
                .id(event.getId())
                .title(event.getTitle())
                .category(event.getCategory() != null ? event.getCategory().getName() : null)
                .collegeName(event.getCollege() != null ? event.getCollege().getName() : null)
                .eventDate(event.getEventDate() != null ? event.getEventDate().toString() : null)
                .eventTime(event.getEventTime() != null ? event.getEventTime().toString() : null)
                .venue(event.getVenue())
                .mode(event.getMode() != null ? event.getMode().name() : null)
                .fee(event.getFee() != null ? event.getFee().doubleValue() : null)
                .imageUrl(event.getImageUrl())
                .build();
    }
}
