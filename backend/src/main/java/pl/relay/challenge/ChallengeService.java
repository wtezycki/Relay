package pl.relay.challenge;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pl.relay.challenge.dto.ChallengeCreateRequest;
import pl.relay.challenge.dto.ChallengeResponse;
import pl.relay.challenge.dto.ChallengeUpdateRequest;

@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;

    @Transactional(readOnly = true)
    public List<ChallengeResponse> getAllChallenges() {
        return challengeRepository.findAll().stream()
                .sorted((left, right) -> Long.compare(
                        right.getId() == null ? 0L : right.getId(),
                        left.getId() == null ? 0L : left.getId()
                ))
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ChallengeResponse> getActiveChallenges() {
        return challengeRepository.findAllByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ChallengeResponse getChallengeById(Long challengeId) {
        return mapToResponse(getRequiredChallenge(challengeId));
    }

    @Transactional
    public void addPointsToActiveChallenge(int pointsToAdd) {
        if (pointsToAdd <= 0) {
            return;
        }

        var activeChallenges = challengeRepository.findAllByIsActiveTrue();
        activeChallenges.forEach(challenge -> challenge.setCurrentPoints(challenge.getCurrentPoints() + pointsToAdd));
        challengeRepository.saveAll(activeChallenges);
    }

    @Transactional
    public ChallengeResponse createChallenge(ChallengeCreateRequest request) {
        var challengeName = normalizeName(request.name());
        var targetPoints = requirePositiveTargetPoints(request.targetPoints());
        var shouldBeActive = request.isActive() == null || request.isActive();

        var challenge = Challenge.builder()
                .name(challengeName)
                .targetPoints(targetPoints)
                .currentPoints(0)
                .isActive(shouldBeActive)
                .build();

        return mapToResponse(challengeRepository.save(challenge));
    }

    @Transactional
    public ChallengeResponse updateChallenge(Long challengeId, ChallengeUpdateRequest request) {
        var challenge = getRequiredChallenge(challengeId);

        if (request.name() != null) {
            challenge.setName(normalizeName(request.name()));
        }
        if (request.targetPoints() != null) {
            challenge.setTargetPoints(requirePositiveTargetPoints(request.targetPoints()));
        }
        if (request.currentPoints() != null) {
            challenge.setCurrentPoints(requireNonNegativeCurrentPoints(request.currentPoints()));
        }
        if (Boolean.TRUE.equals(request.isActive())) {
            challenge.setActive(true);
        } else if (Boolean.FALSE.equals(request.isActive())) {
            challenge.setActive(false);
        }

        return mapToResponse(challengeRepository.save(challenge));
    }

    @Transactional
    public ChallengeResponse activateChallenge(Long challengeId) {
        var challenge = getRequiredChallenge(challengeId);
        challenge.setActive(true);
        return mapToResponse(challengeRepository.save(challenge));
    }

    @Transactional
    public void deleteChallenge(Long challengeId) {
        var challenge = getRequiredChallenge(challengeId);
        challengeRepository.delete(challenge);
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

    private int requireNonNegativeCurrentPoints(Integer currentPoints) {
        if (currentPoints == null || currentPoints < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Challenge currentPoints must not be negative.");
        }

        return currentPoints;
    }

    private Challenge getRequiredChallenge(Long challengeId) {
        return challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Challenge not found."));
    }
}
