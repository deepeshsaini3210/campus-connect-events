package com.university.events.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * EventHighlight entity for event highlights/features
 */
@Entity
@Table(name = "event_highlights")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventHighlight {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;
    
    @Column(name = "highlight_text", nullable = false, length = 255)
    private String highlightText;
    
    @Column(name = "order_index", nullable = false)
    @Builder.Default
    private Integer orderIndex = 0;
}
