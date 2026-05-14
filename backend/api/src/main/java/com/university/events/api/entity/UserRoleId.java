package com.university.events.api.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

/**
 * Composite primary key for UserRole entity
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserRoleId implements Serializable {
    
    private Long userId;
    private Long roleId;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserRoleId that = (UserRoleId) o;
        return Objects.equals(userId, that.userId) && Objects.equals(roleId, that.roleId);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(userId, roleId);
    }
}
