package pl.relay.challenge;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class ChallengeServiceTest {

    @Test
    void shouldReturnAllChallengesSortedByDescendingId() {
        var challengeRepository = mock(ChallengeRepository.class);
        var challengeService = new ChallengeService(challengeRepository);

        var olderChallenge = Challenge.builder()
                .id(1L)
                .name("Run to Paris")
                .targetPoints(1_000)
                .currentPoints(100)
                .isActive(false)
                .build();
        var newerChallenge = Challenge.builder()
                .id(2L)
                .name("Run to Rome")
                .targetPoints(2_000)
                .currentPoints(300)
                .isActive(true)
                .build();

        when(challengeRepository.findAll()).thenReturn(List.of(olderChallenge, newerChallenge));

        var response = challengeService.getAllChallenges();

        assertThat(response).hasSize(2);
        assertThat(response.get(0).id()).isEqualTo(2L);
        assertThat(response.get(1).id()).isEqualTo(1L);
    }

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
    void shouldCreateNewActiveChallengeAndDeactivatePreviousOne() {
        var challengeRepository = mock(ChallengeRepository.class);
        var challengeService = new ChallengeService(challengeRepository);

        var existingChallenge = Challenge.builder()
                .id(1L)
                .name("Run to Paris")
                .targetPoints(500)
                .currentPoints(50)
                .isActive(true)
                .build();

        when(challengeRepository.findByIsActiveTrue()).thenReturn(Optional.of(existingChallenge));
        when(challengeRepository.save(any(Challenge.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = challengeService.createChallenge(new ChallengeCreateRequest("Run to Rome", 1_500, true));

        assertThat(existingChallenge.isActive()).isFalse();
        assertThat(response.name()).isEqualTo("Run to Rome");
        assertThat(response.targetPoints()).isEqualTo(1_500);
        assertThat(response.currentPoints()).isZero();
        assertThat(response.isActive()).isTrue();
        assertThat(response.progressPercentage()).isZero();
        verify(challengeRepository, times(2)).save(any(Challenge.class));
    }

    @Test
    void shouldUpdateChallengeFields() {
        var challengeRepository = mock(ChallengeRepository.class);
        var challengeService = new ChallengeService(challengeRepository);

        var challenge = Challenge.builder()
                .id(4L)
                .name("Run to Berlin")
                .targetPoints(900)
                .currentPoints(90)
                .isActive(false)
                .build();

        when(challengeRepository.findById(4L)).thenReturn(Optional.of(challenge));
        when(challengeRepository.save(any(Challenge.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = challengeService.updateChallenge(4L, new ChallengeUpdateRequest("Run to Madrid", 950, 100, true));

        assertThat(response.name()).isEqualTo("Run to Madrid");
        assertThat(response.targetPoints()).isEqualTo(950);
        assertThat(response.currentPoints()).isEqualTo(100);
        assertThat(response.isActive()).isTrue();
    }

    @Test
    void shouldActivateChallengeById() {
        var challengeRepository = mock(ChallengeRepository.class);
        var challengeService = new ChallengeService(challengeRepository);

        var existingActiveChallenge = Challenge.builder()
                .id(1L)
                .name("Run to Paris")
                .targetPoints(500)
                .currentPoints(50)
                .isActive(true)
                .build();
        var challengeToActivate = Challenge.builder()
                .id(2L)
                .name("Run to Rome")
                .targetPoints(1_500)
                .currentPoints(0)
                .isActive(false)
                .build();

        when(challengeRepository.findById(2L)).thenReturn(Optional.of(challengeToActivate));
        when(challengeRepository.findByIsActiveTrue()).thenReturn(Optional.of(existingActiveChallenge));
        when(challengeRepository.save(any(Challenge.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = challengeService.activateChallenge(2L);

        assertThat(existingActiveChallenge.isActive()).isFalse();
        assertThat(response.id()).isEqualTo(2L);
        assertThat(response.isActive()).isTrue();
    }

    @Test
    void shouldDeleteChallengeById() {
        var challengeRepository = mock(ChallengeRepository.class);
        var challengeService = new ChallengeService(challengeRepository);

        var challenge = Challenge.builder()
                .id(6L)
                .name("Run to Prague")
                .targetPoints(700)
                .currentPoints(70)
                .isActive(false)
                .build();

        when(challengeRepository.findById(6L)).thenReturn(Optional.of(challenge));

        challengeService.deleteChallenge(6L);

        verify(challengeRepository).delete(challenge);
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

    @Test
    void shouldRejectChallengeCreationWhenTargetPointsAreInvalid() {
        var challengeRepository = mock(ChallengeRepository.class);
        var challengeService = new ChallengeService(challengeRepository);

        assertThatThrownBy(() -> challengeService.createChallenge(new ChallengeCreateRequest("Run to Madrid", 0, true)))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(exception -> assertThat(((ResponseStatusException) exception).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void shouldIgnorePointUpdateWhenPointsAreNotPositive() {
        var challengeRepository = mock(ChallengeRepository.class);
        var challengeService = new ChallengeService(challengeRepository);

        challengeService.addPointsToActiveChallenge(0);

        verify(challengeRepository, never()).findByIsActiveTrue();
    }
}
