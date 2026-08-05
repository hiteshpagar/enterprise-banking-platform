package com.ebp.user.mapper;

import org.springframework.stereotype.Component;

import com.ebp.user.dto.CreateUserRequest;
import com.ebp.user.dto.UpdateUserRequest;
import com.ebp.user.dto.UserResponse;
import com.ebp.user.dto.UserSummaryResponse;
import com.ebp.user.entity.User;

@Component
public class UserMapper {

    /**
     * Convert CreateUserRequest to User entity.
     */
    public User toEntity(CreateUserRequest request) {

        User user = new User();

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setEnabled(request.isEnabled());

        return user;
    }

    /**
     * Convert User entity to UserResponse.
     */
    public UserResponse toResponse(User user) {

        UserResponse response = new UserResponse();

        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setEnabled(user.getEnabled());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());

        return response;
    }

    /**
     * Convert User entity to UserSummaryResponse.
     */
    public UserSummaryResponse toSummary(User user) {

        UserSummaryResponse response = new UserSummaryResponse();

        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setEnabled(user.getEnabled());

        return response;
    }

    /**
     * Update existing User entity.
     */
    public void updateEntity(User user, UpdateUserRequest request) {

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setEnabled(request.isEnabled());
    }
}