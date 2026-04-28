package pl.relay.activity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;

class ActivityServiceTest {

    @Test
    void shouldReturnActivitiesSortedByDescendingId() {
        var activityRepository = mock(ActivityRepository.class);
        var activityService = new ActivityService(activityRepository);

        var firstActivity = Activity.builder()
                .id(2L)
                .stravaActivityId(2002L)
                .userId(7L)
                .userFirstName("Anna")
                .userLastName("Nowak")
                .teamPoints(5)
                .type("Run")
                .activityName("Morning Run")
                .occurredAt(Instant.parse("2026-04-28T08:00:00Z"))
                .distanceMeters(4200d)
                .movingTimeSeconds(1500L)
                .build();
        var secondActivity = Activity.builder()
                .id(1L)
                .stravaActivityId(2001L)
                .userId(8L)
                .userFirstName("Jan")
                .userLastName("Kowalski")
                .teamPoints(3)
                .type("Walk")
                .activityName("Lunch Walk")
                .occurredAt(Instant.parse("2026-04-27T12:00:00Z"))
                .distanceMeters(2500d)
                .movingTimeSeconds(1800L)
                .build();

        when(activityRepository.findAll()).thenReturn(List.of(secondActivity, firstActivity));

        var response = activityService.getActivities();

        assertThat(response).hasSize(2);
        assertThat(response.get(0).id()).isEqualTo(2L);
        assertThat(response.get(0).userFirstName()).isEqualTo("Anna");
        assertThat(response.get(0).teamPoints()).isEqualTo(5);
        assertThat(response.get(0).activityName()).isEqualTo("Morning Run");
        assertThat(response.get(0).distanceMeters()).isEqualTo(4200d);
        assertThat(response.get(1).id()).isEqualTo(1L);
        assertThat(response.get(1).userLastName()).isEqualTo("Kowalski");
        assertThat(response.get(1).type()).isEqualTo("Walk");
    }
}
