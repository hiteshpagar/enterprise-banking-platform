package com.ebp.auth.controller;

import com.ebp.auth.dto.LoginRequest;
import com.ebp.auth.dto.LoginResponse;
import com.ebp.auth.service.AuthenticationService;
import jakarta.validation.Valid;
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
}