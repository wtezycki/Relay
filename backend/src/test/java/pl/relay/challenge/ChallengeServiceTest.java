package pl.relay.challenge;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class ChallengeServiceTest {

    @Test
    void shouldReturnCurrentChallengeWithProgressPercentage() {
        var challengeRepository = mock(ChallengeRepository.class);
        var challengeService = new ChallengeService(challengeRepository);

        var challenge = Challenge.builder()
                .id(3L)
                .name("Run to Tokyo")
                .targetPoints(8_000)
                .currentPoints(2_000)
                .isActive(true)
                .build();

        when(challengeRepository.findByIsActiveTrue()).thenReturn(Optional.of(challenge));

        var response = challengeService.getCurrentChallenge();

        assertThat(response.id()).isEqualTo(3L);
        assertThat(response.name()).isEqualTo("Run to Tokyo");
        assertThat(response.targetPoints()).isEqualTo(8_000);
        assertThat(response.currentPoints()).isEqualTo(2_000);
        assertThat(response.isActive()).isTrue();
        assertThat(response.progressPercentage()).isEqualTo(25.0);
    }

    @Test
    void shouldAddPointsToActiveChallenge() {
        var challengeRepository = mock(ChallengeRepository.class);
        var challengeService = new ChallengeService(challengeRepository);

        var challenge = Challenge.builder()
                .id(5L)
                .name("Run to Berlin")
                .targetPoints(1_000)
                .currentPoints(120)
                .isActive(true)
                .build();

        when(challengeRepository.findByIsActiveTrue()).thenReturn(Optional.of(challenge));

        challengeService.addPointsToActiveChallenge(8);

        var savedChallenge = ArgumentCaptor.forClass(Challenge.class);
        verify(challengeRepository).save(savedChallenge.capture());
        assertThat(savedChallenge.getValue().getCurrentPoints()).isEqualTo(128);
    }

    @Test
    void shouldReturnNotFoundWhenActiveChallengeDoesNotExist() {
        var challengeRepository = mock(ChallengeRepository.class);
        var challengeService = new ChallengeService(challengeRepository);

        when(challengeRepository.findByIsActiveTrue()).thenReturn(Optional.empty());

        assertThatThrownBy(challengeService::getCurrentChallenge)
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(exception -> assertThat(((ResponseStatusException) exception).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));
    }
}
