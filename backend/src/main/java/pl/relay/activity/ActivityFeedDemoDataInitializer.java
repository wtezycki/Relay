package pl.relay.activity;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "relay.dev.seed-demo-activities", havingValue = "true", matchIfMissing = true)
public class ActivityFeedDemoDataInitializer implements CommandLineRunner {

    private final ActivityRepository activityRepository;
    private final ActivityNormalizerService activityNormalizerService;

    @Override
    public void run(String... args) {
        var demoActivities = List.of(
                demoActivity(9_000_001L, 1_001L, "Wiktor", "Nowak", "Evening Run", "Run", 8_400d, 2_520L, 2),
                demoActivity(9_000_002L, 1_002L, "Ania", "Kowalska", "Lunch Walk", "Walk", 3_200d, 2_340L, 4),
                demoActivity(9_000_003L, 1_003L, "Marek", "Zielinski", "Morning Ride", "Ride", 18_500d, 3_180L, 8),
                demoActivity(9_000_004L, 1_004L, "Ola", "Wisniewska", "Yoga Reset", "Yoga", 0d, 2_700L, 12),
                demoActivity(9_000_005L, 1_002L, "Ania", "Kowalska", "Tempo Run", "Run", 5_600d, 1_920L, 18),
                demoActivity(9_000_006L, 1_003L, "Marek", "Zielinski", "Recovery Walk", "Walk", 2_400d, 1_680L, 26)
        );

        demoActivities.stream()
                .filter(activity -> !activityRepository.existsByStravaActivityId(activity.getStravaActivityId()))
                .forEach(activityRepository::save);
    }

    private Activity demoActivity(
            Long stravaActivityId,
            Long userId,
            String userFirstName,
            String userLastName,
            String activityName,
            String type,
            double distanceMeters,
            long movingTimeSeconds,
            long hoursAgo
    ) {
        return Activity.builder()
                .stravaActivityId(stravaActivityId)
                .userId(userId)
                .userFirstName(userFirstName)
                .userLastName(userLastName)
                .teamPoints(activityNormalizerService.calculateTeamPoints(type, distanceMeters, movingTimeSeconds))
                .type(type)
                .activityName(activityName)
                .occurredAt(Instant.now().minus(hoursAgo, ChronoUnit.HOURS))
                .distanceMeters(distanceMeters)
                .movingTimeSeconds(movingTimeSeconds)
                .build();
    }
}
