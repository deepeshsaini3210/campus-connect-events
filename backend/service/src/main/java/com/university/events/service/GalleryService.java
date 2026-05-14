package com.university.events.service;

import com.university.events.api.common.PaginatedResponse;
import com.university.events.api.dto.gallery.CreateGalleryImageRequest;
import com.university.events.api.dto.gallery.GalleryImageDto;

public interface GalleryService {
    PaginatedResponse<GalleryImageDto> listGallery(String category, Boolean featured, int page, int size);

    GalleryImageDto createGalleryImage(CreateGalleryImageRequest request);
}
