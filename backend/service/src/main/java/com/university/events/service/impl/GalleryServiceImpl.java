package com.university.events.service.impl;

import com.university.events.api.common.PaginatedResponse;
import com.university.events.api.dto.gallery.CreateGalleryImageRequest;
import com.university.events.api.dto.gallery.GalleryImageDto;
import com.university.events.api.entity.Event;
import com.university.events.api.entity.GalleryImage;
import com.university.events.service.GalleryService;
import com.university.events.service.repository.EventRepository;
import com.university.events.service.repository.GalleryImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GalleryServiceImpl implements GalleryService {

    private final GalleryImageRepository galleryImageRepository;
    private final EventRepository eventRepository;

    @Override
    @Transactional(readOnly = true)
    public PaginatedResponse<GalleryImageDto> listGallery(String category, Boolean featured, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "eventDate"));
        Page<GalleryImage> galleryPage;
        if (Boolean.TRUE.equals(featured)) {
            galleryPage = galleryImageRepository.findFeatured(pageable);
        } else {
            galleryPage = galleryImageRepository.findByCategory(category, pageable);
        }

        List<GalleryImageDto> items = galleryPage.getContent().stream().map(this::toDto).toList();
        return PaginatedResponse.of(items, galleryPage.getNumber(), galleryPage.getSize(), galleryPage.getTotalElements());
    }

    @Override
    @Transactional
    public GalleryImageDto createGalleryImage(CreateGalleryImageRequest request) {
        Event event = null;
        if (request.getEventId() != null) {
            event = eventRepository.findById(request.getEventId())
                    .orElseThrow(() -> new RuntimeException("Event not found"));
        }

        GalleryImage image = GalleryImage.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .event(event)
                .imageUrl(request.getImageUrl())
                .eventDate(request.getEventDate())
                .category(request.getCategory())
                .isFeatured(Boolean.TRUE.equals(request.getIsFeatured()))
                .build();

        return toDto(galleryImageRepository.save(image));
    }

    private GalleryImageDto toDto(GalleryImage image) {
        return GalleryImageDto.builder()
                .id(image.getId())
                .title(image.getTitle())
                .description(image.getDescription())
                .eventId(image.getEvent() != null ? image.getEvent().getId() : null)
                .eventTitle(image.getEvent() != null ? image.getEvent().getTitle() : null)
                .eventVenue(image.getEvent() != null ? image.getEvent().getVenue() : null)
                .imageUrl(image.getImageUrl())
                .eventDate(image.getEventDate())
                .category(image.getCategory())
                .isFeatured(image.getIsFeatured())
                .build();
    }
}
