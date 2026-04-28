package pl.relay.activity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.ExchangeFunction;
import org.springframework.web.reactive.function.client.WebClient;
import pl.relay.challenge.ChallengeService;
import pl.relay.user.StravaTokenService;
import pl.relay.user.User;
import pl.relay.user.UserRepository;
import reactor.core.publisher.Mono;

class ActivitySyncWorkerTest {

    @Test
    void shouldSaveOnlyNewActivitiesReturnedByStrava() {
        var userRepository = mock(UserRepository.class);
        var activityRepository = mock(ActivityRepository.class);
        var activityNormalizerService = mock(ActivityNormalizerService.class);
        var challengeService = mock(ChallengeService.class);
        var stravaTokenService = mock(StravaTokenService.class);

        var user = User.builder()
                .id(7L)
                .firstName("Wiktor")
                .lastName("Nowak")
                .accessToken("token-123")
                .build();

        when(userRepository.findAll()).thenReturn(List.of(user));
        when(stravaTokenService.ensureValidAccessToken(user)).thenReturn(user);
        when(activityRepository.existsByStravaActivityId(101L)).thenReturn(false);
        when(activityRepository.existsByStravaActivityId(102L)).thenReturn(true);
        when(activityRepository.save(any(Activity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(activityNormalizerService.calculateTeamPoints(eq("Run"), eq(2_500d), eq(1_500L))).thenReturn(2);

        var webClient = WebClient.builder()
                .exchangeFunction(stravaActivitiesResponse())
                .build();

        var worker = new ActivitySyncWorker(
                userRepository,
                activityRepository,
                activityNormalizerService,
                challengeService,
                stravaTokenService,
                webClient
        );

        worker.syncActivities();

        var savedActivity = ArgumentCaptor.forClass(Activity.class);
        verify(activityRepository).save(savedActivity.capture());

        assertThat(savedActivity.getValue().getStravaActivityId()).isEqualTo(101L);
        assertThat(savedActivity.getValue().getUserId()).isEqualTo(7L);
        assertThat(savedActivity.getValue().getUserFirstName()).isEqualTo("Wiktor");
        assertThat(savedActivity.getValue().getUserLastName()).isEqualTo("Nowak");
        assertThat(savedActivity.getValue().getTeamPoints()).isEqualTo(2);
        assertThat(savedActivity.getValue().getType()).isEqualTo("Run");
        assertThat(savedActivity.getValue().getActivityName()).isEqualTo("Lunch Run");
        assertThat(savedActivity.getValue().getOccurredAt()).isEqualTo(java.time.Instant.parse("2026-04-28T10:00:00Z"));
        assertThat(savedActivity.getValue().getDistanceMeters()).isEqualTo(2_500d);
        assertThat(savedActivity.getValue().getMovingTimeSeconds()).isEqualTo(1_500L);
        verify(stravaTokenService).ensureValidAccessToken(user);
        verify(challengeService).addPointsToActiveChallenge(2);
    }

    private ExchangeFunction stravaActivitiesResponse() {
        return request -> {
            assertThat(request.url().getPath()).isEqualTo("/athlete/activities");
            assertThat(request.url().getQuery()).isEqualTo("per_page=200");
            assertThat(request.headers().getFirst(HttpHeaders.AUTHORIZATION)).isEqualTo("Bearer token-123");

            var responseBody = """
                    [
                      {"id":101,"name":"Lunch Run","type":"Run","distance":2500,"moving_time":1500,"start_date":"2026-04-28T10:00:00Z"},
                      {"id":102,"name":"Evening Yoga","type":"Yoga","distance":0,"moving_time":1800,"start_date":"2026-04-27T18:30:00Z"}
                    ]
                    """;

            return Mono.just(ClientResponse.create(HttpStatus.OK)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .body(responseBody)
                    .build());
        };
    }
}
