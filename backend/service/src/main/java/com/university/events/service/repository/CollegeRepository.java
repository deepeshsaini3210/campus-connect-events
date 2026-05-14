package com.university.events.service.repository;

import com.university.events.api.entity.College;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for College entity
 */
@Repository
public interface CollegeRepository extends JpaRepository<College, Long> {
    
    Optional<College> findByCode(String code);
    
    boolean existsByCode(String code);
    
    boolean existsByName(String name);
    
    @Query("SELECT c FROM College c WHERE c.isActive = true")
    Page<College> findActiveColleges(Pageable pageable);
    
    @Query("SELECT c FROM College c WHERE c.city = :city AND c.isActive = true")
    Page<College> findByCity(@Param("city") String city, Pageable pageable);
    
    @Query("SELECT c FROM College c WHERE c.state = :state AND c.isActive = true")
    Page<College> findByState(@Param("state") String state, Pageable pageable);
    
    @Query("SELECT c FROM College c WHERE c.type = :type AND c.isActive = true")
    Page<College> findByType(@Param("type") College.CollegeType type, Pageable pageable);
    
    @Query("SELECT c FROM College c WHERE " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.code) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND c.isActive = true")
    Page<College> searchColleges(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT c FROM College c WHERE c.isActive = true ORDER BY c.name")
    List<College> findAllActiveColleges();
    
    @Query("SELECT COUNT(c) FROM College c WHERE c.city = :city AND c.isActive = true")
    long countByCity(@Param("city") String city);
    
    @Query("SELECT COUNT(c) FROM College c WHERE c.state = :state AND c.isActive = true")
    long countByState(@Param("state") String state);
    
    @Query("SELECT COUNT(c) FROM College c WHERE c.type = :type AND c.isActive = true")
    long countByType(@Param("type") College.CollegeType type);
}
