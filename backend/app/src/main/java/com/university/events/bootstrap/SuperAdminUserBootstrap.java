package com.university.events.bootstrap;

import com.university.events.api.entity.College;
import com.university.events.api.entity.Role;
import com.university.events.api.entity.User;
import com.university.events.service.repository.CollegeRepository;
import com.university.events.service.repository.RoleRepository;
import com.university.events.service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Creates the database-only SUPER_ADMIN user when configured in application.yml.
 * Not exposed on signup — full system access (admin, onboarding, approvals).
 */
@Component
@Order(2)
@ConditionalOnProperty(prefix = "app.bootstrap.super-admin", name = "email")
@Slf4j
@RequiredArgsConstructor
public class SuperAdminUserBootstrap implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CollegeRepository collegeRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.super-admin.email}")
    private String email;

    @Value("${app.bootstrap.super-admin.password}")
    private String password;

    @Value("${app.bootstrap.super-admin.first-name:System}")
    private String firstName;

    @Value("${app.bootstrap.super-admin.last-name:Administrator}")
    private String lastName;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        String normalizedEmail = email.trim();
        if (userRepository.existsByEmail(normalizedEmail)) {
            log.debug("Super admin user already exists: {}", normalizedEmail);
            return;
        }

        Role superAdmin = roleRepository.findByName("SUPER_ADMIN")
                .orElseThrow(() -> new IllegalStateException(
                        "SUPER_ADMIN role missing — run AuthReferenceDataBootstrap first"));

        College college = collegeRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No college found for super admin user"));

        LocalDateTime now = LocalDateTime.now();
        User user = User.builder()
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(password))
                .firstName(firstName)
                .lastName(lastName)
                .college(college)
                .role(superAdmin)
                .isActive(true)
                .emailVerified(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        userRepository.save(user);
        log.info("Created SUPER_ADMIN user (database-only role): {}", email);
    }
}
