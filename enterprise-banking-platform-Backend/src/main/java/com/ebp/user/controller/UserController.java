package com.ebp.user.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
import java.util.List;

import com.ebp.user.dto.CreateUserRequest;
import com.ebp.user.dto.UpdateUserRequest;
import com.ebp.user.dto.UserResponse;
import com.ebp.user.dto.UserSummaryResponse;
import com.ebp.user.service.UserService;

import jakarta.validation.Valid;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import org.springframework.web.bind.annotation.RequestParam;

import com.ebp.common.dto.PageResponse;
import com.ebp.user.dto.UserSummaryResponse;

@RestController
@RequestMapping("/api/users")
@Tag(
	    name = "User Management",
	    description = "CRUD operations for system users"
	)
@Validated

public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('USER_CREATE')")
    @Operation(
    	    summary = "Create User",
    	    description = "Creates a new system user."
    	)
    	@ApiResponses({
    	    @ApiResponse(responseCode = "201", description = "User created successfully"),
    	    @ApiResponse(responseCode = "409", description = "Username or email already exists"),
    	    @ApiResponse(responseCode = "403", description = "Access denied")
    	})
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request) {

        UserResponse response = userService.createUser(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_VIEW')")
    @Operation(
    	    summary = "Get User By ID",
    	    description = "Retrieve a user using its UUID."
    	)
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable UUID id) {

        UserResponse response = userService.getUserById(id);

        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @PreAuthorize("hasAuthority('USER_VIEW')")
    @Operation(
            summary = "Get All Users",
            description = "Retrieve users with pagination and sorting."
    )
    public ResponseEntity<PageResponse<UserSummaryResponse>> getAllUsers(

    		@RequestParam(defaultValue = "") String search,
    		
    		@RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "10") int size,

            @RequestParam(defaultValue = "username") String sortBy,

            @RequestParam(defaultValue = "asc") String sortDirection) {

        PageResponse<UserSummaryResponse> response =
                userService.getAllUsers(
                		search,
                        page,
                        size,
                        sortBy,
                        sortDirection);

        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    @Operation(
    	    summary = "Update User",
    	    description = "Update an existing user."
    	)
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request) {

        UserResponse response = userService.updateUser(id, request);

        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_DELETE')")
    @Operation(
    	    summary = "Delete User",
    	    description = "Delete a user."
    	)
    public ResponseEntity<Void> deleteUser(
            @PathVariable UUID id) {

        userService.deleteUser(id);

        return ResponseEntity.noContent().build();
    }
}