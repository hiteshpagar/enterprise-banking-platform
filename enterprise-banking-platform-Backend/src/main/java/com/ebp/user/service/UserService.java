	package com.ebp.user.service;

import java.util.List;
import java.util.UUID;

import com.ebp.user.dto.CreateUserRequest;
import com.ebp.user.dto.UpdateUserRequest;
import com.ebp.user.dto.UserResponse;
import com.ebp.user.dto.UserSummaryResponse;
import com.ebp.common.dto.PageResponse;

public interface UserService {

	UserResponse createUser(CreateUserRequest request);

	UserResponse getUserById(UUID id);

	PageResponse<UserSummaryResponse> getAllUsers(
	        String search,
	        int page,
	        int size,
	        String sortBy,
	        String sortDirection);

	UserResponse updateUser(UUID id, UpdateUserRequest request);

	void deleteUser(UUID id);
}