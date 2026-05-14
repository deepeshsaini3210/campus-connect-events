package com.university.events.controller;

import com.university.events.api.common.ApiResponse;
import com.university.events.api.common.PaginatedResponse;
import com.university.events.api.entity.Notification;
import com.university.events.service.repository.NotificationRepository;
import com.university.events.service.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PaginatedResponse<Notification>>> myNotifications(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        Long userId = SecurityUtils.requireCurrentUserId();
        var p = notificationRepository.findByUserId(userId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.success(PaginatedResponse.of(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements())));
    }

    @PostMapping("/my/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> markAllRead() {
        notificationRepository.markAllAsReadByUserId(SecurityUtils.requireCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(null, "Notifications marked as read"));
    }

}
