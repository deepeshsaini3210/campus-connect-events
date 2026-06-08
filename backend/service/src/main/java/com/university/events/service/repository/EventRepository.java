package com.university.events.service.repository;

import com.university.events.api.entity.Event;
import com.university.events.api.entity.Event.EventMode;
import com.university.events.api.entity.Event.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Event entity
 */
@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    @Query("SELECT e FROM Event e WHERE e.id = :id AND e.status IN ('APPROVED', 'COMPLETED')")
    Optional<Event> findActiveEventById(@Param("id") Long id);
    
    @Query("SELECT e FROM Event e WHERE " +
           "(:keyword IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:categoryId IS NULL OR e.category.id = :categoryId) AND " +
           "(:collegeId IS NULL OR e.college.id = :collegeId) AND " +
           "(:mode IS NULL OR e.mode = :mode) AND " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:isFeatured IS NULL OR e.isFeatured = :isFeatured) AND " +
           "(:isPartnerEvent IS NULL OR e.isPartnerEvent = :isPartnerEvent) AND " +
           "(:freeOnly IS NULL OR :freeOnly = false OR e.fee = 0) AND " +
           "(:paidOnly IS NULL OR :paidOnly = false OR e.fee > 0)")
    Page<Event> searchEvents(@Param("keyword") String keyword,
                            @Param("categoryId") Long categoryId,
                            @Param("collegeId") Long collegeId,
                            @Param("mode") EventMode mode,
                            @Param("status") EventStatus status,
                            @Param("isFeatured") Boolean isFeatured,
                            @Param("isPartnerEvent") Boolean isPartnerEvent,
                            @Param("freeOnly") Boolean freeOnly,
                            @Param("paidOnly") Boolean paidOnly,
                            Pageable pageable);
    
    @Query("SELECT e FROM Event e WHERE e.isFeatured = true AND e.status = 'APPROVED' AND e.eventDate >= :currentDate")
    Page<Event> findFeaturedEvents(@Param("currentDate") LocalDate currentDate, Pageable pageable);
    
    @Query("SELECT e FROM Event e WHERE e.status = 'APPROVED' AND e.eventDate >= :currentDate")
    Page<Event> findUpcomingEvents(@Param("currentDate") LocalDate currentDate, Pageable pageable);
    
    @Query("SELECT e FROM Event e WHERE e.organizer.id = :organizerId")
    Page<Event> findByOrganizerId(@Param("organizerId") Long organizerId, Pageable pageable);
    
    @Query("SELECT e FROM Event e WHERE e.college.id = :collegeId")
    Page<Event> findByCollegeId(@Param("collegeId") Long collegeId, Pageable pageable);
    
    @Query("SELECT e FROM Event e WHERE e.status = 'PENDING_APPROVAL'")
    Page<Event> findPendingApprovalEvents(Pageable pageable);
    
    @Query("SELECT e FROM Event e WHERE e.eventDate < :currentDate AND e.status != 'COMPLETED' AND e.status != 'CANCELLED'")
    List<Event> findPastEventsToComplete(@Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT COUNT(e) FROM Event e WHERE e.college.id = :collegeId AND e.status = 'APPROVED'")
    long countApprovedEventsByCollege(@Param("collegeId") Long collegeId);
    
    @Query("SELECT COUNT(e) FROM Event e WHERE e.organizer.id = :organizerId AND e.status = 'APPROVED'")
    long countApprovedEventsByOrganizer(@Param("organizerId") Long organizerId);
    
    @Query("SELECT e FROM Event e WHERE e.deadline < :currentDate AND e.status = 'APPROVED'")
    List<Event> findEventsWithExpiredDeadline(@Param("currentDate") LocalDate currentDate);

    @Query("SELECT e FROM Event e WHERE e.eventDate = :today AND e.status IN ('APPROVED', 'COMPLETED') ORDER BY e.eventTime ASC")
    List<Event> findTodayEvents(@Param("today") LocalDate today);
}
