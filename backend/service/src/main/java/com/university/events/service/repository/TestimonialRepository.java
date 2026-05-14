package com.university.events.service.repository;

import com.university.events.api.entity.Testimonial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestimonialRepository extends JpaRepository<Testimonial, Long> {
    List<Testimonial> findByIsFeaturedTrueOrderByDisplayOrderAsc();
}
