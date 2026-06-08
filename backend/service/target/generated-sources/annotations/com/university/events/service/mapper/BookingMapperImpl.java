package com.university.events.service.mapper;

import com.university.events.api.dto.booking.BookingDto;
import com.university.events.api.entity.Booking;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-06-08T11:43:44+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.10 (Homebrew)"
)
@Component
public class BookingMapperImpl implements BookingMapper {

    @Override
    public BookingDto toDto(Booking booking) {
        if ( booking == null ) {
            return null;
        }

        BookingDto.BookingDtoBuilder bookingDto = BookingDto.builder();

        bookingDto.event( mapEventSummary( booking.getEvent() ) );
        bookingDto.id( booking.getId() );
        bookingDto.bookingReference( booking.getBookingReference() );
        bookingDto.qrCode( booking.getQrCode() );
        if ( booking.getStatus() != null ) {
            bookingDto.status( booking.getStatus().name() );
        }
        if ( booking.getPaymentStatus() != null ) {
            bookingDto.paymentStatus( booking.getPaymentStatus().name() );
        }
        bookingDto.createdAt( booking.getCreatedAt() );
        bookingDto.updatedAt( booking.getUpdatedAt() );

        return bookingDto.build();
    }
}
