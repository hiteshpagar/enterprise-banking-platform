package com.ebp.auth.service;

import com.ebp.auth.dto.LoginRequest;
import com.ebp.auth.dto.LoginResponse;
import com.ebp.auth.dto.CurrentUserResponse;
import com.ebp.security.jwt.JwtService;
import com.ebp.security.userdetails.CustomUserDetails;

import java.util.List;

import org.springframework.security.core.GrantedAuthority;
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

    public CurrentUserResponse getCurrentUser(CustomUserDetails principal) {

        List<String> roles = principal.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith("ROLE_"))
                .map(authority -> authority.substring("ROLE_".length()))
                .sorted()
                .toList();

        List<String> permissions = principal.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> !authority.startsWith("ROLE_"))
                .sorted()
                .toList();

        return new CurrentUserResponse(
                principal.getUser().getId(),
                principal.getUser().getUsername(),
                principal.getUser().getEmail(),
                roles,
                permissions);
    }
}
