package com.ebp.auth.dto;

import java.util.List;
import java.util.UUID;

public record CurrentUserResponse(
        UUID id,
        String username,
        String email,
        List<String> roles,
        List<String> permissions) {
}
