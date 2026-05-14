package com.university.events.service.repository;

import com.university.events.api.entity.GalleryImage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GalleryImageRepository extends JpaRepository<GalleryImage, Long> {

    @Query("SELECT g FROM GalleryImage g WHERE (:category IS NULL OR LOWER(g.category) = LOWER(:category))")
    Page<GalleryImage> findByCategory(@Param("category") String category, Pageable pageable);

    @Query("SELECT g FROM GalleryImage g WHERE g.isFeatured = true")
    Page<GalleryImage> findFeatured(Pageable pageable);
}
