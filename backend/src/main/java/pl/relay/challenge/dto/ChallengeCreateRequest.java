package pl.relay.challenge.dto;

public record ChallengeCreateRequest(
        String name,
        Integer targetPoints,
        Boolean isActive
) {
}
