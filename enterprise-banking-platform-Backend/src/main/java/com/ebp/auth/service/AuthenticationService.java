package com.ebp.auth.service;

import com.ebp.auth.dto.ChangeCredentialsRequest;
import com.ebp.auth.dto.CurrentUserResponse;
import com.ebp.auth.dto.LoginRequest;
import com.ebp.auth.dto.LoginResponse;
import com.ebp.security.jwt.JwtService;
import com.ebp.security.userdetails.CustomUserDetails;
import com.ebp.user.entity.User;
import com.ebp.user.exception.UserAlreadyExistsException;
import com.ebp.user.repository.UserRepository;

import java.util.List;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthenticationService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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

        boolean requiresCredentialChange =
                Boolean.TRUE.equals(user.getUser().getMustChangeCredentials());

        return new LoginResponse(token, "Bearer", requiresCredentialChange);
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

        boolean requiresCredentialChange =
                Boolean.TRUE.equals(principal.getUser().getMustChangeCredentials());

        return new CurrentUserResponse(
                principal.getUser().getId(),
                principal.getUser().getUsername(),
                principal.getUser().getEmail(),
                roles,
                permissions,
                requiresCredentialChange);
    }

    @Transactional
    public void changeCredentials(CustomUserDetails principal, ChangeCredentialsRequest request) {

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match.");
        }

        User user = principal.getUser();

        String newUsername = request.getNewUsername().trim();

        if (!user.getUsername().equals(newUsername) && userRepository.existsByUsername(newUsername)) {
            throw new UserAlreadyExistsException("Username '" + newUsername + "' is already taken.");
        }

        user.setUsername(newUsername);
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangeCredentials(false);

        userRepository.save(user);
    }
}
