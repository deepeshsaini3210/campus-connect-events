package com.university.events.service.mapper;

import com.university.events.api.dto.event.CreateEventRequest;
import com.university.events.api.dto.event.EventDto;
import com.university.events.api.dto.event.UpdateEventRequest;
import com.university.events.api.entity.Event;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-08T11:43:44+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.10 (Homebrew)"
)
@Component
public class EventMapperImpl implements EventMapper {

    @Override
    public Event toEntity(CreateEventRequest request) {
        if ( request == null ) {
            return null;
        }

        Event.EventBuilder event = Event.builder();

        event.title( request.getTitle() );
        event.description( request.getDescription() );
        event.eventDate( request.getEventDate() );
        event.eventTime( request.getEventTime() );
        event.venue( request.getVenue() );
        if ( request.getMode() != null ) {
            event.mode( Enum.valueOf( Event.EventMode.class, request.getMode() ) );
        }
        event.fee( request.getFee() );
        event.seatsTotal( request.getSeatsTotal() );
        event.deadline( request.getDeadline() );
        event.isFeatured( request.getIsFeatured() );
        event.isPartnerEvent( request.getIsPartnerEvent() );

        event.seatsLeft( request.getSeatsTotal() );

        return event.build();
    }

    @Override
    public EventDto toDto(Event event) {
        if ( event == null ) {
            return null;
        }

        EventDto.EventDtoBuilder eventDto = EventDto.builder();

        eventDto.highlights( mapHighlights( event.getHighlights() ) );
        eventDto.organizer( mapOrganizer( event.getOrganizer() ) );
        eventDto.category( mapEventCategory( event.getCategory() ) );
        eventDto.college( mapCollege( event.getCollege() ) );
        eventDto.id( event.getId() );
        eventDto.title( event.getTitle() );
        eventDto.description( event.getDescription() );
        eventDto.eventDate( event.getEventDate() );
        eventDto.eventTime( event.getEventTime() );
        eventDto.venue( event.getVenue() );
        if ( event.getMode() != null ) {
            eventDto.mode( event.getMode().name() );
        }
        eventDto.fee( event.getFee() );
        eventDto.seatsTotal( event.getSeatsTotal() );
        eventDto.seatsLeft( event.getSeatsLeft() );
        eventDto.deadline( event.getDeadline() );
        if ( event.getStatus() != null ) {
            eventDto.status( event.getStatus().name() );
        }
        eventDto.isFeatured( event.getIsFeatured() );
        eventDto.isPartnerEvent( event.getIsPartnerEvent() );
        eventDto.imageUrl( event.getImageUrl() );

        return eventDto.build();
    }

    @Override
    public void updateEntity(UpdateEventRequest request, Event event) {
        if ( request == null ) {
            return;
        }

        event.setTitle( request.getTitle() );
        event.setDescription( request.getDescription() );
        event.setEventDate( request.getEventDate() );
        event.setEventTime( request.getEventTime() );
        event.setVenue( request.getVenue() );
        if ( request.getMode() != null ) {
            event.setMode( Enum.valueOf( Event.EventMode.class, request.getMode() ) );
        }
        else {
            event.setMode( null );
        }
        event.setFee( request.getFee() );
        event.setSeatsTotal( request.getSeatsTotal() );
        event.setDeadline( request.getDeadline() );
        event.setIsFeatured( request.getIsFeatured() );
        event.setIsPartnerEvent( request.getIsPartnerEvent() );
        event.setImageUrl( request.getImageUrl() );
    }
}
