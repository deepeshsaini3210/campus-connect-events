package com.university.events.bootstrap;

import com.university.events.api.entity.College;
import com.university.events.api.entity.Role;
import com.university.events.service.repository.CollegeRepository;
import com.university.events.service.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Ensures roles and colleges exist so registration (FK to roles/colleges) succeeds on fresh DBs.
 * Matches frontend defaults: roleId 1–5, collegeId 1–7 when tables start empty.
 */
@Component
@Order(1)
@Slf4j
@RequiredArgsConstructor
public class AuthReferenceDataBootstrap implements ApplicationRunner {

    private final RoleRepository roleRepository;
    private final CollegeRepository collegeRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedRoles();
        seedColleges();
    }

    private void seedRoles() {
        ensureRole("STUDENT", "Regular student user");
        ensureRole("COLLEGE_ADMIN", "College administrator");
        ensureRole("EVENT_ORGANIZER", "Event organizer");
        ensureRole("EXTERNAL_PARTNER", "External college partner");
        ensureRole("SUPER_ADMIN", "System super administrator");
    }

    private void ensureRole(String name, String description) {
        if (!roleRepository.existsByName(name)) {
            roleRepository.save(Role.builder().name(name).description(description).build());
            log.info("Seeded role: {}", name);
        }
    }

    private void seedColleges() {
        LocalDateTime now = LocalDateTime.now();
        ensureCollege(now, "Mandsaur University", "MU", College.CollegeType.UNIVERSITY, "Mandsaur", "MP");
        ensureCollege(now, "IIT Indore", "IITI", College.CollegeType.INSTITUTE, "Indore", "MP");
        ensureCollege(now, "DAVV Indore", "DAVV", College.CollegeType.UNIVERSITY, "Indore", "MP");
        ensureCollege(now, "IIM Indore", "IIMI", College.CollegeType.INSTITUTE, "Indore", "MP");
        ensureCollege(now, "MITS Gwalior", "MITS", College.CollegeType.INSTITUTE, "Gwalior", "MP");
        ensureCollege(now, "SGSITS Indore", "SGSITS", College.CollegeType.INSTITUTE, "Indore", "MP");
        ensureCollege(now, "Medi-Caps University", "MEDICAPS", College.CollegeType.UNIVERSITY, "Indore", "MP");
    }

    private void ensureCollege(
            LocalDateTime now,
            String name,
            String code,
            College.CollegeType type,
            String city,
            String state
    ) {
        if (!collegeRepository.existsByCode(code)) {
            collegeRepository.save(College.builder()
                    .name(name)
                    .code(code)
                    .type(type)
                    .city(city)
                    .state(state)
                    .country("India")
                    .isActive(true)
                    .createdAt(now)
                    .updatedAt(now)
                    .build());
            log.info("Seeded college: {} ({})", name, code);
        }
    }
}
