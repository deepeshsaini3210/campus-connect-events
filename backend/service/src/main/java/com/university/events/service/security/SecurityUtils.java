package com.university.events.service.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

/**
 * Reads the authenticated user id from the Spring Security context.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static Long requireCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new UsernameNotFoundException("User is not authenticated");
        }
        return principal.getId();
    }
}
