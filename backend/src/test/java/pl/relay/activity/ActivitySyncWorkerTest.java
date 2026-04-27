package pl.relay.activity;

import static org.assertj.core.api.Assertions.assertThat;
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
import pl.relay.user.User;
import pl.relay.user.UserRepository;
import reactor.core.publisher.Mono;

class ActivitySyncWorkerTest {

    @Test
    void shouldSaveOnlyNewActivitiesReturnedByStrava() {
        var userRepository = mock(UserRepository.class);
        var activityRepository = mock(ActivityRepository.class);
        var activityNormalizerService = mock(ActivityNormalizerService.class);

        var user = User.builder()
                .id(7L)
                .accessToken("token-123")
                .build();

        when(userRepository.findAll()).thenReturn(List.of(user));
        when(activityRepository.existsByStravaActivityId(101L)).thenReturn(false);
        when(activityRepository.existsByStravaActivityId(102L)).thenReturn(true);
        when(activityNormalizerService.calculateTeamPoints(eq("Run"), eq(2_500d), eq(1_500L))).thenReturn(2);

        var webClient = WebClient.builder()
                .exchangeFunction(stravaActivitiesResponse())
                .build();

        var worker = new ActivitySyncWorker(
                userRepository,
                activityRepository,
                activityNormalizerService,
                webClient
        );

        worker.syncActivities();

        var savedActivity = ArgumentCaptor.forClass(Activity.class);
        verify(activityRepository).save(savedActivity.capture());

        assertThat(savedActivity.getValue().getStravaActivityId()).isEqualTo(101L);
        assertThat(savedActivity.getValue().getUserId()).isEqualTo(7L);
        assertThat(savedActivity.getValue().getTeamPoints()).isEqualTo(2);
        assertThat(savedActivity.getValue().getType()).isEqualTo("Run");
    }

    private ExchangeFunction stravaActivitiesResponse() {
        return request -> {
            assertThat(request.url().getPath()).isEqualTo("/athlete/activities");
            assertThat(request.url().getQuery()).isEqualTo("per_page=200");
            assertThat(request.headers().getFirst(HttpHeaders.AUTHORIZATION)).isEqualTo("Bearer token-123");

            var responseBody = """
                    [
                      {"id":101,"type":"Run","distance":2500,"moving_time":1500},
                      {"id":102,"type":"Yoga","distance":0,"moving_time":1800}
                    ]
                    """;

            return Mono.just(ClientResponse.create(HttpStatus.OK)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .body(responseBody)
                    .build());
        };
    }
}
