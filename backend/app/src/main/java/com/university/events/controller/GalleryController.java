package com.university.events.controller;

import com.university.events.api.common.ApiResponse;
import com.university.events.api.common.PaginatedResponse;
import com.university.events.api.dto.gallery.CreateGalleryImageRequest;
import com.university.events.api.dto.gallery.GalleryImageDto;
import com.university.events.service.GalleryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/gallery")
@RequiredArgsConstructor
public class GalleryController {

    private final GalleryService galleryService;

    @GetMapping
    public ResponseEntity<ApiResponse<PaginatedResponse<GalleryImageDto>>> listGallery(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "featured", required = false) Boolean featured,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "18") int size) {
        return ResponseEntity.ok(ApiResponse.success(galleryService.listGallery(category, featured, page, size)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EVENT_ORGANIZER', 'COLLEGE_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<GalleryImageDto>> createGalleryImage(@Valid @RequestBody CreateGalleryImageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(galleryService.createGalleryImage(request)));
    }
}
