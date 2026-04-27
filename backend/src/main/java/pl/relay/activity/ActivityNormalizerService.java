package pl.relay.activity;

import java.util.Locale;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class ActivityNormalizerService {

    private static final int METERS_PER_TEAM_POINT = 1_000;
    private static final int SECONDS_PER_TIME_BLOCK = 15 * 60;
    private static final int POINTS_PER_TIME_BLOCK = 2;

    private static final Set<String> DISTANCE_BASED_ACTIVITY_TYPES = Set.of(
            "run",
            "trailrun",
            "virtualrun",
            "walk",
            "hike",
            "ride",
            "virtualride",
            "mountainbikeride",
            "gravelride",
            "ebikeride",
            "handcycle",
            "wheelchair"
    );

    private static final Set<String> TIME_BASED_ACTIVITY_TYPES = Set.of(
            "yoga",
            "weighttraining",
            "weightlifting",
            "workout",
            "swim",
            "swimming"
    );

    public int calculateTeamPoints(String activityType, double distanceMeters, long movingTimeSeconds) {
        if (isDistanceBasedActivity(activityType)) {
            return calculateDistanceTeamPoints(distanceMeters);
        }

        if (isTimeBasedActivity(activityType)) {
            return calculateTimeTeamPoints(movingTimeSeconds);
        }

        if (distanceMeters > 0) {
            return calculateDistanceTeamPoints(distanceMeters);
        }

        return calculateTimeTeamPoints(movingTimeSeconds);
    }

    public int calculateDistanceTeamPoints(double distanceMeters) {
        if (distanceMeters <= 0) {
            return 0;
        }

        return (int) Math.floor(distanceMeters / METERS_PER_TEAM_POINT);
    }

    public int calculateTimeTeamPoints(long movingTimeSeconds) {
        if (movingTimeSeconds <= 0) {
            return 0;
        }

        return (int) (movingTimeSeconds / SECONDS_PER_TIME_BLOCK) * POINTS_PER_TIME_BLOCK;
    }

    private boolean isDistanceBasedActivity(String activityType) {
        return DISTANCE_BASED_ACTIVITY_TYPES.contains(normalizeActivityType(activityType));
    }

    private boolean isTimeBasedActivity(String activityType) {
        return TIME_BASED_ACTIVITY_TYPES.contains(normalizeActivityType(activityType));
    }

    private String normalizeActivityType(String activityType) {
        if (activityType == null) {
            return "";
        }

        return activityType
                .trim()
                .replace("_", "")
                .replace("-", "")
                .replace(" ", "")
                .toLowerCase(Locale.ROOT);
    }
}
