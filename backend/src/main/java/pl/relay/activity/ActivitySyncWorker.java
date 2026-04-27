package pl.relay.activity;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import pl.relay.challenge.ChallengeService;
import pl.relay.user.User;
import pl.relay.user.UserRepository;

@Slf4j
@Component
@RequiredArgsConstructor
public class ActivitySyncWorker {

    private static final int ACTIVITIES_PAGE_SIZE = 200;

    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final ActivityNormalizerService activityNormalizerService;
    private final ChallengeService challengeService;
    private final WebClient stravaWebClient;

    @Scheduled(fixedDelayString = "${relay.strava.sync.fixed-delay-ms:14400000}")
    public void syncActivities() {
        userRepository.findAll().forEach(this::syncActivitiesForUser);
    }

    private void syncActivitiesForUser(User user) {
        try {
            fetchActivities(user).stream()
                    .filter(activity -> activity.id() != null)
                    .filter(activity -> !activityRepository.existsByStravaActivityId(activity.id()))
                    .map(activity -> mapToActivity(user, activity))
                    .forEach(this::saveActivityAndUpdateChallenge);
        } catch (WebClientResponseException exception) {
            log.warn(
                    "Failed to synchronize Strava activities for userId={} with status={}",
                    user.getId(),
                    exception.getStatusCode(),
                    exception
            );
        } catch (RuntimeException exception) {
            log.warn("Failed to synchronize Strava activities for userId={}", user.getId(), exception);
        }
    }

    private void saveActivityAndUpdateChallenge(Activity activity) {
        var savedActivity = activityRepository.save(activity);
        challengeService.addPointsToActiveChallenge(savedActivity.getTeamPoints());
    }

    private List<StravaActivityResponse> fetchActivities(User user) {
        return stravaWebClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/athlete/activities")
                        .queryParam("per_page", ACTIVITIES_PAGE_SIZE)
                        .build())
                .headers(headers -> headers.setBearerAuth(user.getAccessToken()))
                .retrieve()
                .bodyToFlux(StravaActivityResponse.class)
                .collectList()
                .blockOptional()
                .orElseGet(List::of);
    }

    private Activity mapToActivity(User user, StravaActivityResponse stravaActivity) {
        var teamPoints = activityNormalizerService.calculateTeamPoints(
                stravaActivity.type(),
                stravaActivity.distance(),
                stravaActivity.movingTime()
        );

        return Activity.builder()
                .stravaActivityId(stravaActivity.id())
                .userId(user.getId())
                .teamPoints(teamPoints)
                .type(stravaActivity.type() == null ? "Unknown" : stravaActivity.type())
                .build();
    }
}
