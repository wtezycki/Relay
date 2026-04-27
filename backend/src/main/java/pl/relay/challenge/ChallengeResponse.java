package pl.relay.challenge;

public record ChallengeResponse(
        Long id,
        String name,
        int targetPoints,
        int currentPoints,
        boolean isActive,
        double progressPercentage
) {
}
