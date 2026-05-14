package com.university.events.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

/**
 * Collaboration entity for college partnerships
 */
@Entity
@Table(name = "collaborations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Collaboration {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_college_id", nullable = false)
    private College requesterCollege;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_college_id", nullable = false)
    private College partnerCollege;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CollaborationStatus status = CollaborationStatus.PENDING;
    
    @Column(name = "request_date", nullable = false)
    @CreatedDate
    private LocalDateTime requestDate;
    
    @Column(name = "response_date")
    private LocalDateTime responseDate;
    
    @Column(columnDefinition = "TEXT")
    private String specialOffers;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    public enum CollaborationStatus {
        PENDING, APPROVED, REJECTED, TERMINATED
    }
}
