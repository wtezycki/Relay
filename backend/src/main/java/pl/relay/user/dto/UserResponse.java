package pl.relay.user.dto;

import pl.relay.user.UserRole;

public record UserResponse(
        Long id,
        Long stravaAthleteId,
        String firstName,
        String lastName,
        String avatarUrl,
        UserRole role,
        int consistencyStreak
) {
}
