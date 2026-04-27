package pl.relay.challenge;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class ChallengeInitializer {

    private final ChallengeRepository challengeRepository;

    @Value("${relay.challenge.default.name:Run to Tokyo}")
    private String defaultChallengeName;

    @Value("${relay.challenge.default.target-points:8000}")
    private int defaultChallengeTargetPoints;

    @Bean
    ApplicationRunner challengeInitializationRunner() {
        return arguments -> {
            if (challengeRepository.count() > 0) {
                return;
            }

            var defaultChallenge = Challenge.builder()
                    .name(defaultChallengeName)
                    .targetPoints(defaultChallengeTargetPoints)
                    .currentPoints(0)
                    .isActive(true)
                    .build();

            challengeRepository.save(defaultChallenge);
        };
    }
}
