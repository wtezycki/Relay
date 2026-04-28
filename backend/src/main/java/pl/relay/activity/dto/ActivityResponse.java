package pl.relay.activity.dto;

import java.time.Instant;
import java.util.Set;

public record ActivityResponse(
        Long id,
        Long stravaActivityId,
        Long userId,
        String userFirstName,
        String userLastName,
        int teamPoints,
        String type,
        String activityName,
        Instant occurredAt,
        Double distanceMeters,
        Long movingTimeSeconds,
        int userConsistencyStreak,
        Set<Long> likedUserIds
) {
}
