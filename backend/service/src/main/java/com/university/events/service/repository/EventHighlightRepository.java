package com.university.events.service.repository;

import com.university.events.api.entity.EventHighlight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for EventHighlight entity
 */
@Repository
public interface EventHighlightRepository extends JpaRepository<EventHighlight, Long> {
    
    List<EventHighlight> findByEventIdOrderByOrderIndex(Long eventId);
    
    @Modifying
    @Query("DELETE FROM EventHighlight eh WHERE eh.event.id = :eventId")
    void deleteByEventId(@Param("eventId") Long eventId);
    
    @Query("SELECT COUNT(eh) FROM EventHighlight eh WHERE eh.event.id = :eventId")
    long countByEventId(@Param("eventId") Long eventId);
}
