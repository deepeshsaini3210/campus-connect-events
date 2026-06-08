package com.university.events.service.mapper;

import com.university.events.api.dto.auth.AuthResponse;
import com.university.events.api.dto.auth.RegisterRequest;
import com.university.events.api.dto.user.UserDto;
import com.university.events.api.entity.User;
import org.springframework.stereotype.Component;

/**
 * Fallback mapper implementation to ensure Spring bean availability
 * even when annotation-generated mappers are not compiled in runtime classpath.
 */
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public User toEntity(RegisterRequest request) {
        if (request == null) {
            return null;
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setIsActive(false);
        user.setEmailVerified(false);
        return user;
    }

    @Override
    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .profileImage(user.getProfileImage())
                .isActive(Boolean.TRUE.equals(user.getIsActive()))
                .emailVerified(Boolean.TRUE.equals(user.getEmailVerified()))
                .role(mapRole(user.getRole()))
                .college(mapCollege(user.getCollege()))
                .build();
    }

    @Override
    public AuthResponse toAuthResponse(User user, String accessToken, String refreshToken, Long expiresIn) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(expiresIn)
                .user(mapUserForAuth(user))
                .build();
    }

    @Override
    public void updateEntity(RegisterRequest request, User user) {
        if (request == null || user == null) {
            return;
        }
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
    }
}
