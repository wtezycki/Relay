package pl.relay.activity;

import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.relay.activity.dto.ActivityResponse;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;

    @Transactional(readOnly = true)
    public List<ActivityResponse> getActivities() {
        return activityRepository.findAll().stream()
                .sorted(Comparator
                        .comparing(Activity::getOccurredAt, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Activity::getId, Comparator.reverseOrder()))
                .map(this::mapToResponse)
                .toList();
    }

    private ActivityResponse mapToResponse(Activity activity) {
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
                activity.getMovingTimeSeconds()
        );
    }
}
