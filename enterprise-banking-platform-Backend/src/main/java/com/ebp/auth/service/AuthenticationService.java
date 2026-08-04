package com.ebp.auth.service;

import com.ebp.auth.dto.LoginRequest;
import com.ebp.auth.dto.LoginResponse;
import com.ebp.security.jwt.JwtService;
import com.ebp.security.userdetails.CustomUserDetails;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthenticationService(
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                        		 request.getUsername(),
                                 request.getPassword()
                        )
                );

        CustomUserDetails user =
                (CustomUserDetails) authentication.getPrincipal();

        String token =
                jwtService.generateToken(user.getUsername());

        return new LoginResponse(token, "Bearer");
    }
}