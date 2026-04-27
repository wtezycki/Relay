package pl.relay.challenge.dto;

public record ChallengeUpdateRequest(
        String name,
        Integer targetPoints,
        Integer currentPoints,
        Boolean isActive
) {
}
