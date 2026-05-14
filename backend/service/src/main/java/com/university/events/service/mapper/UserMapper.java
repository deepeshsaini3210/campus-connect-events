package com.university.events.service.mapper;

import com.university.events.api.dto.auth.RegisterRequest;
import com.university.events.api.dto.auth.AuthResponse;
import com.university.events.api.dto.user.UserDto;
import com.university.events.api.entity.User;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

/**
 * Mapper for User entity and DTOs
 */
public interface UserMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "emailVerified", constant = "false")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "userRoles", ignore = true)
    @Mapping(target = "organizedEvents", ignore = true)
    @Mapping(target = "bookings", ignore = true)
    @Mapping(target = "notifications", ignore = true)
    @Mapping(target = "college", ignore = true)
    @Mapping(target = "role", ignore = true)
    User toEntity(RegisterRequest request);
    
    @Mapping(target = "role", source = "role", qualifiedByName = "mapRole")
    @Mapping(target = "college", source = "college", qualifiedByName = "mapCollege")
    UserDto toDto(User user);
    
    @Mapping(target = "user", source = "user", qualifiedByName = "mapUserForAuth")
    AuthResponse toAuthResponse(User user, String accessToken, String refreshToken, Long expiresIn);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "userRoles", ignore = true)
    @Mapping(target = "organizedEvents", ignore = true)
    @Mapping(target = "bookings", ignore = true)
    @Mapping(target = "notifications", ignore = true)
    @Mapping(target = "college", ignore = true)
    @Mapping(target = "role", ignore = true)
    void updateEntity(RegisterRequest request, @MappingTarget User user);
    
    @Named("mapRole")
    default UserDto.RoleDto mapRole(com.university.events.api.entity.Role role) {
        if (role == null) {
            return null;
        }
        return UserDto.RoleDto.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .build();
    }
    
    @Named("mapCollege")
    default UserDto.CollegeDto mapCollege(com.university.events.api.entity.College college) {
        if (college == null) {
            return null;
        }
        return UserDto.CollegeDto.builder()
                .id(college.getId())
                .name(college.getName())
                .code(college.getCode())
                .city(college.getCity())
                .state(college.getState())
                .logo(college.getLogo())
                .build();
    }
    
    @Named("mapUserForAuth")
    default AuthResponse.UserDto mapUserForAuth(User user) {
        if (user == null) {
            return null;
        }
        return AuthResponse.UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .profileImage(user.getProfileImage())
                .role(user.getRole() != null ? user.getRole().getName() : null)
                .collegeName(user.getCollege() != null ? user.getCollege().getName() : null)
                .emailVerified(user.getEmailVerified())
                .build();
    }
}
