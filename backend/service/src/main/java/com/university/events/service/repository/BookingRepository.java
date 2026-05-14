package com.university.events.service.repository;

import com.university.events.api.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Booking entity
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    Optional<Booking> findByBookingReference(String bookingReference);
    
    Optional<Booking> findByUserIdAndEventId(Long userId, Long eventId);
    
    boolean existsByUserIdAndEventId(Long userId, Long eventId);
    
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId")
    Page<Booking> findByUserId(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT b FROM Booking b WHERE b.event.id = :eventId")
    Page<Booking> findByEventId(@Param("eventId") Long eventId, Pageable pageable);
    
    @Query("SELECT b FROM Booking b WHERE b.event.id = :eventId AND b.status = 'CONFIRMED'")
    Page<Booking> findConfirmedBookingsByEventId(@Param("eventId") Long eventId, Pageable pageable);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.event.id = :eventId AND b.status = 'CONFIRMED'")
    long countConfirmedBookingsByEventId(@Param("eventId") Long eventId);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.user.id = :userId AND b.status = 'CONFIRMED'")
    long countConfirmedBookingsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT b FROM Booking b WHERE b.event.id = :eventId AND b.user.id = :userId")
    Optional<Booking> findByEventIdAndUserId(@Param("eventId") Long eventId, @Param("userId") Long userId);
    
    @Query("SELECT b FROM Booking b WHERE b.status = :status")
    Page<Booking> findByStatus(@Param("status") Booking.BookingStatus status, Pageable pageable);
    
    @Query("SELECT b FROM Booking b WHERE b.paymentStatus = :paymentStatus")
    Page<Booking> findByPaymentStatus(@Param("paymentStatus") Booking.PaymentStatus paymentStatus, Pageable pageable);
}
