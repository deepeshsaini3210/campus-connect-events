package com.university.events.api.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User DTO for API responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String profileImage;
    private RoleDto role;
    private CollegeDto college;
    private Boolean isActive;
    private Boolean emailVerified;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoleDto {
        private Long id;
        private String name;
        private String description;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CollegeDto {
        private Long id;
        private String name;
        private String code;
        private String city;
        private String state;
        private String logo;
    }
}
