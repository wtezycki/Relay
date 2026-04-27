package pl.relay.activity.dto;

public record ActivityResponse(
        Long id,
        Long stravaActivityId,
        Long userId,
        int teamPoints,
        String type
) {
}
