package pl.relay.user;

public record UserResponse(
        Long id,
        Long stravaAthleteId,
        String firstName,
        String lastName,
        String avatarUrl
) {
}
