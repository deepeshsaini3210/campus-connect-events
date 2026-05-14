package com.university.events.service.repository;

import com.university.events.api.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for User entity
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);

    Optional<User> findByEmailVerificationToken(String token);

    Optional<User> findByPasswordResetToken(String token);
    
    boolean existsByEmail(String email);
    
    Optional<User> findByEmailAndIsActiveTrue(String email);
    
    @Query("SELECT u FROM User u WHERE u.college.id = :collegeId AND u.isActive = true")
    Page<User> findByCollegeId(@Param("collegeId") Long collegeId, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.role.name = :roleName AND u.isActive = true")
    Page<User> findByRoleName(@Param("roleName") String roleName, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.emailVerified = false AND u.isActive = true")
    Page<User> findUnverifiedUsers(Pageable pageable);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.college.id = :collegeId AND u.isActive = true")
    long countByCollegeId(@Param("collegeId") Long collegeId);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role.name = :roleName AND u.isActive = true")
    long countByRoleName(@Param("roleName") String roleName);
}
