package pl.relay.activity;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import pl.relay.activity.dto.ActivityResponse;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;

    @Transactional(readOnly = true)
    public List<ActivityResponse> getActivities() {
        List<Activity> allActivities = activityRepository.findAll();
        
        Map<Long, Integer> userStreaks = allActivities.stream()
                .map(Activity::getUserId)
                .distinct()
                .collect(Collectors.toMap(
                        userId -> userId,
                        userId -> calculateStreakFromActivities(
                                allActivities.stream()
                                        .filter(a -> a.getUserId().equals(userId))
                                        .toList()
                        )
                ));

        return allActivities.stream()
                .sorted(Comparator
                        .comparing(Activity::getOccurredAt, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Activity::getId, Comparator.reverseOrder()))
                .map(activity -> mapToResponse(activity, userStreaks.getOrDefault(activity.getUserId(), 0)))
                .toList();
    }

    public int calculateConsistencyStreak(Long userId) {
        List<Activity> activities = activityRepository.findByUserIdOrderByOccurredAtDesc(userId);
        return calculateStreakFromActivities(activities);
    }

    private int calculateStreakFromActivities(List<Activity> activities) {
        Set<LocalDate> activityDates = activities.stream()
                .filter(a -> a.getTeamPoints() > 0)
                .map(a -> a.getOccurredAt().atZone(ZoneOffset.UTC).toLocalDate())
                .collect(Collectors.toSet());

        if (activityDates.isEmpty()) {
            return 0;
        }

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        int streak = 0;

        if (activityDates.contains(today)) {
            streak++;
            LocalDate date = today.minusDays(1);
            while (activityDates.contains(date)) {
                streak++;
                date = date.minusDays(1);
            }
        } else if (activityDates.contains(today.minusDays(1))) {
            streak++;
            LocalDate date = today.minusDays(2);
            while (activityDates.contains(date)) {
                streak++;
                date = date.minusDays(1);
            }
        }

        return streak;
    }

    @Transactional
    public ActivityResponse toggleLike(Long activityId, Long userId) {
        var activity = activityRepository.findById(activityId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity not found"));
        
        if (activity.getLikedUserIds().contains(userId)) {
            activity.getLikedUserIds().remove(userId);
        } else {
            activity.getLikedUserIds().add(userId);
        }
        
        var savedActivity = activityRepository.save(activity);
        int streak = calculateConsistencyStreak(savedActivity.getUserId());
        return mapToResponse(savedActivity, streak);
    }

    private ActivityResponse mapToResponse(Activity activity, int streak) {
        return new ActivityResponse(
                activity.getId(),
                activity.getStravaActivityId(),
                activity.getUserId(),
                activity.getUserFirstName(),
                activity.getUserLastName(),
                activity.getTeamPoints(),
                activity.getType(),
                activity.getActivityName(),
                activity.getOccurredAt(),
                activity.getDistanceMeters(),
                activity.getMovingTimeSeconds(),
                streak,
                new LinkedHashSet<>(activity.getLikedUserIds())
        );
    }
}
