package pl.relay.challenge.dto;

public record ChallengeResponse(
        Long id,
        String name,
        int targetPoints,
        int currentPoints,
        boolean isActive,
        double progressPercentage
) {
}
