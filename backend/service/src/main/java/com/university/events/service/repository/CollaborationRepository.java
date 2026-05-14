package com.university.events.service.repository;

import com.university.events.api.entity.Collaboration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Collaboration entity
 */
@Repository
public interface CollaborationRepository extends JpaRepository<Collaboration, Long> {
    
    @Query("SELECT c FROM Collaboration c WHERE c.requesterCollege.id = :collegeId")
    Page<Collaboration> findByRequesterCollegeId(@Param("collegeId") Long collegeId, Pageable pageable);
    
    @Query("SELECT c FROM Collaboration c WHERE c.partnerCollege.id = :collegeId")
    Page<Collaboration> findByPartnerCollegeId(@Param("collegeId") Long collegeId, Pageable pageable);
    
    @Query("SELECT c FROM Collaboration c WHERE (c.requesterCollege.id = :collegeId OR c.partnerCollege.id = :collegeId)")
    Page<Collaboration> findByCollegeId(@Param("collegeId") Long collegeId, Pageable pageable);
    
    @Query("SELECT c FROM Collaboration c WHERE c.status = :status")
    Page<Collaboration> findByStatus(@Param("status") Collaboration.CollaborationStatus status, Pageable pageable);
    
    @Query("SELECT c FROM Collaboration c WHERE c.partnerCollege.id = :collegeId AND c.status = 'PENDING'")
    List<Collaboration> findPendingRequestsForPartner(@Param("collegeId") Long collegeId);
    
    @Query("SELECT c FROM Collaboration c WHERE (c.requesterCollege.id = :collegeId OR c.partnerCollege.id = :collegeId) AND c.status = 'APPROVED'")
    Page<Collaboration> findActiveCollaborations(@Param("collegeId") Long collegeId, Pageable pageable);
    
    @Query("SELECT COUNT(c) FROM Collaboration c WHERE (c.requesterCollege.id = :collegeId OR c.partnerCollege.id = :collegeId) AND c.status = 'APPROVED'")
    long countActiveCollaborationsByCollege(@Param("collegeId") Long collegeId);
    
    @Query("SELECT COUNT(c) FROM Collaboration c WHERE c.status = :status")
    long countByStatus(@Param("status") Collaboration.CollaborationStatus status);
}
