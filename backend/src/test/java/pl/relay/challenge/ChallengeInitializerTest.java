package pl.relay.challenge;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

class ChallengeInitializerTest {

    @Test
    void shouldSeedDefaultChallengeWhenRepositoryIsEmpty() throws Exception {
        var challengeRepository = mock(ChallengeRepository.class);
        var challengeInitializer = new ChallengeInitializer(challengeRepository);

        ReflectionTestUtils.setField(challengeInitializer, "defaultChallengeName", "Run to Tokyo");
        ReflectionTestUtils.setField(challengeInitializer, "defaultChallengeTargetPoints", 8_000);

        when(challengeRepository.count()).thenReturn(0L);

        challengeInitializer.challengeInitializationRunner().run(null);

        var savedChallenge = ArgumentCaptor.forClass(Challenge.class);
        verify(challengeRepository).save(savedChallenge.capture());
        assertThat(savedChallenge.getValue().getName()).isEqualTo("Run to Tokyo");
        assertThat(savedChallenge.getValue().getTargetPoints()).isEqualTo(8_000);
        assertThat(savedChallenge.getValue().getCurrentPoints()).isZero();
        assertThat(savedChallenge.getValue().isActive()).isTrue();
    }

    @Test
    void shouldNotSeedDefaultChallengeWhenRepositoryAlreadyContainsData() throws Exception {
        var challengeRepository = mock(ChallengeRepository.class);
        var challengeInitializer = new ChallengeInitializer(challengeRepository);

        ReflectionTestUtils.setField(challengeInitializer, "defaultChallengeName", "Run to Tokyo");
        ReflectionTestUtils.setField(challengeInitializer, "defaultChallengeTargetPoints", 8_000);

        when(challengeRepository.count()).thenReturn(1L);

        challengeInitializer.challengeInitializationRunner().run(null);

        verify(challengeRepository, never()).save(org.mockito.ArgumentMatchers.any(Challenge.class));
    }
}
