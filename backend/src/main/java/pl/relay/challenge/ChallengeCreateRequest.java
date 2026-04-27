package pl.relay.challenge;

public record ChallengeCreateRequest(
        String name,
        Integer targetPoints,
        Boolean isActive
) {
}
