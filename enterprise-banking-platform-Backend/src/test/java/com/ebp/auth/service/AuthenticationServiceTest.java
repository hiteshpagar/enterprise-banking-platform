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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthenticationService authenticationService;

    private User testUser;
    private CustomUserDetails customUserDetails;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("hashedPassword");
        testUser.setMustChangeCredentials(true);

        customUserDetails = new CustomUserDetails(testUser, Collections.emptyList());
    }

    @Test
    void login_WhenCredentialsRequireChange_ReturnsRequiresCredentialChangeTrue() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("tempPass123");

        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(customUserDetails);
        when(jwtService.generateToken("testuser")).thenReturn("mock-token");

        LoginResponse response = authenticationService.login(request);

        assertNotNull(response);
        assertEquals("mock-token", response.accessToken());
        assertEquals("Bearer", response.tokenType());
        assertTrue(response.requiresCredentialChange());
    }

    @Test
    void login_WhenCredentialsDoNotRequireChange_ReturnsRequiresCredentialChangeFalse() {
        testUser.setMustChangeCredentials(false);
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("permanentPass");

        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(customUserDetails);
        when(jwtService.generateToken("testuser")).thenReturn("mock-token");

        LoginResponse response = authenticationService.login(request);

        assertNotNull(response);
        assertFalse(response.requiresCredentialChange());
    }

    @Test
    void getCurrentUser_IncludesRequiresCredentialChange() {
        CurrentUserResponse response = authenticationService.getCurrentUser(customUserDetails);

        assertNotNull(response);
        assertTrue(response.requiresCredentialChange());
    }

    @Test
    void changeCredentials_PasswordMismatch_ThrowsIllegalArgumentException() {
        ChangeCredentialsRequest request = new ChangeCredentialsRequest();
        request.setNewUsername("newuser");
        request.setNewPassword("Password123!");
        request.setConfirmPassword("MismatchPass!");

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> authenticationService.changeCredentials(customUserDetails, request)
        );

        assertEquals("Passwords do not match.", ex.getMessage());
    }

    @Test
    void changeCredentials_UsernameAlreadyTaken_ThrowsUserAlreadyExistsException() {
        ChangeCredentialsRequest request = new ChangeCredentialsRequest();
        request.setNewUsername("existinguser");
        request.setNewPassword("Password123!");
        request.setConfirmPassword("Password123!");

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        UserAlreadyExistsException ex = assertThrows(
                UserAlreadyExistsException.class,
                () -> authenticationService.changeCredentials(customUserDetails, request)
        );

        assertTrue(ex.getMessage().contains("already taken"));
    }

    @Test
    void changeCredentials_ValidRequest_UpdatesUserAndClearsMustChangeFlag() {
        ChangeCredentialsRequest request = new ChangeCredentialsRequest();
        request.setNewUsername("newusername");
        request.setNewPassword("NewSecurePassword123");
        request.setConfirmPassword("NewSecurePassword123");

        when(userRepository.existsByUsername("newusername")).thenReturn(false);
        when(passwordEncoder.encode("NewSecurePassword123")).thenReturn("newHashedPassword");

        authenticationService.changeCredentials(customUserDetails, request);

        assertEquals("newusername", testUser.getUsername());
        assertEquals("newHashedPassword", testUser.getPasswordHash());
        assertFalse(testUser.getMustChangeCredentials());
        verify(userRepository, times(1)).save(testUser);
    }
}
