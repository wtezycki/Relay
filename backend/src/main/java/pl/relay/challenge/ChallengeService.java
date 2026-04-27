package pl.relay.challenge;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;

    @Transactional(readOnly = true)
    public ChallengeResponse getCurrentChallenge() {
        var challenge = challengeRepository.findByIsActiveTrue()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Active challenge not found."));

        return mapToResponse(challenge);
    }

    @Transactional
    public void addPointsToActiveChallenge(int pointsToAdd) {
        if (pointsToAdd <= 0) {
            return;
        }

        challengeRepository.findByIsActiveTrue().ifPresent(challenge -> {
            challenge.setCurrentPoints(challenge.getCurrentPoints() + pointsToAdd);
            challengeRepository.save(challenge);
        });
    }

    @Transactional
    public ChallengeResponse createChallenge(ChallengeCreateRequest request) {
        var challengeName = normalizeName(request.name());
        var targetPoints = requirePositiveTargetPoints(request.targetPoints());
        var shouldBeActive = request.isActive() == null || request.isActive();

        if (shouldBeActive) {
            challengeRepository.findByIsActiveTrue().ifPresent(activeChallenge -> {
                activeChallenge.setActive(false);
                challengeRepository.save(activeChallenge);
            });
        }

        var challenge = Challenge.builder()
                .name(challengeName)
                .targetPoints(targetPoints)
                .currentPoints(0)
                .isActive(shouldBeActive)
                .build();

        return mapToResponse(challengeRepository.save(challenge));
    }

    private ChallengeResponse mapToResponse(Challenge challenge) {
        var targetPoints = challenge.getTargetPoints();
        var currentPoints = challenge.getCurrentPoints();
        var progressPercentage = targetPoints <= 0
                ? 0.0
                : (currentPoints * 100.0) / targetPoints;

        return new ChallengeResponse(
                challenge.getId(),
                challenge.getName(),
                targetPoints,
                currentPoints,
                challenge.isActive(),
                progressPercentage
        );
    }

    private String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Challenge name must not be blank.");
        }

        return name.trim();
    }

    private int requirePositiveTargetPoints(Integer targetPoints) {
        if (targetPoints == null || targetPoints <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Challenge targetPoints must be greater than zero.");
        }

        return targetPoints;
    }
}
