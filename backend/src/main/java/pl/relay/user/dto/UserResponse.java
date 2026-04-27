package pl.relay.user.dto;

public record UserResponse(
        Long id,
        Long stravaAthleteId,
        String firstName,
        String lastName,
        String avatarUrl
) {
}
