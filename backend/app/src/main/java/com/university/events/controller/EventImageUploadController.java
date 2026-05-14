package com.university.events.controller;

import com.university.events.api.common.ApiResponse;
import com.university.events.service.storage.EventImageStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/v1/events/images")
@RequiredArgsConstructor
@Tag(name = "Event images", description = "Upload event poster images (stored in MinIO)")
public class EventImageUploadController {

    private final EventImageStorageService eventImageStorageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('EVENT_ORGANIZER', 'COLLEGE_ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Upload event image", description = "Returns a public URL to store in event.imageUrl")
    public ResponseEntity<ApiResponse<String>> upload(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File is required", HttpStatus.BAD_REQUEST));
        }
        try {
            String url = eventImageStorageService.upload(
                    file.getInputStream(),
                    file.getSize(),
                    file.getContentType(),
                    file.getOriginalFilename());
            return ResponseEntity.ok(ApiResponse.success(url));
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage(), HttpStatus.BAD_REQUEST));
        } catch (IOException ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Could not read uploaded file", HttpStatus.BAD_REQUEST));
        } catch (RuntimeException ex) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }
}
