package pl.relay.activity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

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
                .teamPoints(5)
                .type("Run")
                .build();
        var secondActivity = Activity.builder()
                .id(1L)
                .stravaActivityId(2001L)
                .userId(8L)
                .teamPoints(3)
                .type("Walk")
                .build();

        when(activityRepository.findAllByOrderByIdDesc()).thenReturn(List.of(firstActivity, secondActivity));

        var response = activityService.getActivities();

        assertThat(response).hasSize(2);
        assertThat(response.get(0).id()).isEqualTo(2L);
        assertThat(response.get(0).teamPoints()).isEqualTo(5);
        assertThat(response.get(1).id()).isEqualTo(1L);
        assertThat(response.get(1).type()).isEqualTo("Walk");
    }
}
