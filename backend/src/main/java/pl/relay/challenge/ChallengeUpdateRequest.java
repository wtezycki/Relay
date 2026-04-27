package pl.relay.challenge;

public record ChallengeUpdateRequest(
        String name,
        Integer targetPoints,
        Integer currentPoints,
        Boolean isActive
) {
}
