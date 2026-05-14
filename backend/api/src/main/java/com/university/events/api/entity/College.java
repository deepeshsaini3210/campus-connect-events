package com.university.events.api.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * College entity representing educational institutions
 */
@Entity
@Table(name = "colleges")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
public class College {

    @EqualsAndHashCode.Include
    @ToString.Include
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ToString.Include
    @Column(unique = true, nullable = false, length = 255)
    private String name;

    @ToString.Include
    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CollegeType type;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 100, columnDefinition = "VARCHAR(100) DEFAULT 'India'")
    @Builder.Default
    private String country = "India";

    @Column(name = "established_year")
    private Integer establishedYear;

    @Column(length = 255)
    private String website;

    @Column(length = 500)
    private String logo;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "college", fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private Set<User> users = new HashSet<>();

    @OneToMany(mappedBy = "college", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private Set<Event> events = new HashSet<>();

    @OneToMany(mappedBy = "requesterCollege", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private Set<Collaboration> requestedCollaborations = new HashSet<>();

    @OneToMany(mappedBy = "partnerCollege", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private Set<Collaboration> partnerCollaborations = new HashSet<>();

    public enum CollegeType {
        UNIVERSITY,
        COLLEGE,
        INSTITUTE
    }
}
