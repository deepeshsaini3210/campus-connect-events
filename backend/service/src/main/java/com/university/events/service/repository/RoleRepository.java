package com.university.events.service.repository;

import com.university.events.api.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Role entity
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    Optional<Role> findByName(String name);
    
    boolean existsByName(String name);
    
    @Query("SELECT r FROM Role r WHERE r.name = :name")
    Optional<Role> findByNameIgnoreCase(@Param("name") String name);
    
    @Query("SELECT r FROM Role r WHERE r.name IN ('STUDENT', 'COLLEGE_ADMIN', 'EVENT_ORGANIZER', 'EXTERNAL_PARTNER', 'SUPER_ADMIN')")
    java.util.List<Role> findDefaultRoles();
}
