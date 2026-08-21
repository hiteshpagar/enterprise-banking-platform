package com.ebp.auth.dto;

public record LoginResponse(
        String accessToken,
        String tokenType,
        boolean requiresCredentialChange) {
}