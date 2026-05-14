package com.university.events.service.repository;

import com.university.events.api.entity.EventCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for EventCategory entity
 */
@Repository
public interface EventCategoryRepository extends JpaRepository<EventCategory, Long> {
    
    Optional<EventCategory> findByName(String name);
    
    boolean existsByName(String name);
    
    @Query("SELECT ec FROM EventCategory ec WHERE ec.isActive = true ORDER BY ec.name")
    List<EventCategory> findActiveCategories();
    
    @Query("SELECT ec FROM EventCategory ec WHERE ec.isActive = true AND ec.name = :name")
    Optional<EventCategory> findActiveByName(@Param("name") String name);
    
    @Query("SELECT COUNT(e) FROM Event e WHERE e.category.id = :categoryId AND e.status = 'APPROVED'")
    long countApprovedEventsByCategory(@Param("categoryId") Long categoryId);
}
