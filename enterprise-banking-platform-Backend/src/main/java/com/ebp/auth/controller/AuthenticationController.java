package com.ebp.auth.controller;

import java.util.Map;

import com.ebp.auth.dto.ChangeCredentialsRequest;
import com.ebp.auth.dto.CurrentUserResponse;
import com.ebp.auth.dto.LoginRequest;
import com.ebp.auth.dto.LoginResponse;
import com.ebp.auth.service.AuthenticationService;
import com.ebp.security.userdetails.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("/api/auth")
@Tag(
	    name = "Authentication",
	    description = "Authentication APIs"
	)
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/login")
    @Operation(
    	    summary = "Authenticate user",
    	    description = "Authenticate user and return JWT access token."
    	)
    	@ApiResponses({
    	    @ApiResponse(responseCode = "200", description = "Login successful"),
    	    @ApiResponse(responseCode = "401", description = "Invalid credentials")
    	})
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = authenticationService.login(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(
            summary = "Get authenticated user",
            description = "Return the authenticated user's safe profile, roles, and permissions."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authenticated user returned"),
            @ApiResponse(responseCode = "401", description = "Authentication required")
    })
    public ResponseEntity<CurrentUserResponse> me(
            @AuthenticationPrincipal CustomUserDetails principal) {

        CurrentUserResponse response =
                authenticationService.getCurrentUser(principal);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-credentials")
    @Operation(
            summary = "Change credentials",
            description = "Allows an authenticated user who is required to change credentials to set a new username and password."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Credentials successfully updated"),
            @ApiResponse(responseCode = "400", description = "Validation error or password mismatch"),
            @ApiResponse(responseCode = "409", description = "Username already taken")
    })
    public ResponseEntity<Map<String, String>> changeCredentials(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody ChangeCredentialsRequest request) {

        authenticationService.changeCredentials(principal, request);

        return ResponseEntity.ok(Map.of("message", "Credentials updated successfully."));
    }
}
