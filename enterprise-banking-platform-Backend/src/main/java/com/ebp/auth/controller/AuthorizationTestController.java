package com.ebp.auth.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthorizationTestController {

    @GetMapping("/api/test/public")
    public String publicApi() {
        return "Public API - No Authentication Required";
    }

    @GetMapping("/api/test/authenticated")
    public String authenticated(Authentication authentication) {

        return "Hello " + authentication.getName();
    }

    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping("/api/test/role")
    public String role(Authentication authentication) {

        return "Welcome SUPER_ADMIN : " + authentication.getName();
    }

    @PreAuthorize("hasAuthority('USER_CREATE')")
    @GetMapping("/api/test/permission")
    public String permission(Authentication authentication) {

        return "You have USER_CREATE permission : " + authentication.getName();
    }

    @GetMapping("/api/test/authorities")
    public Object authorities(Authentication authentication) {

        return authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .toList();
    }
}