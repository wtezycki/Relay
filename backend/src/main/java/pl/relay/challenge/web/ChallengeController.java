package pl.relay.challenge.web;

import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.relay.challenge.ChallengeService;
import pl.relay.challenge.dto.ChallengeCreateRequest;
import pl.relay.challenge.dto.ChallengeResponse;
import pl.relay.challenge.dto.ChallengeUpdateRequest;

@RestController
@RequestMapping("/api/challenge")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;

    @GetMapping
    public List<ChallengeResponse> getAllChallenges() {
        return challengeService.getAllChallenges();
    }

    @GetMapping("/current")
    public ChallengeResponse getCurrentChallenge() {
        return challengeService.getCurrentChallenge();
    }

    @GetMapping("/{challengeId}")
    public ChallengeResponse getChallengeById(@PathVariable Long challengeId) {
        return challengeService.getChallengeById(challengeId);
    }

    @PostMapping
    public ChallengeResponse createChallenge(@RequestBody ChallengeCreateRequest request) {
        return challengeService.createChallenge(request);
    }

    @PutMapping("/{challengeId}")
    public ChallengeResponse updateChallenge(
            @PathVariable Long challengeId,
            @RequestBody ChallengeUpdateRequest request
    ) {
        return challengeService.updateChallenge(challengeId, request);
    }

    @PatchMapping("/{challengeId}/activate")
    public ChallengeResponse activateChallenge(@PathVariable Long challengeId) {
        return challengeService.activateChallenge(challengeId);
    }

    @DeleteMapping("/{challengeId}")
    public void deleteChallenge(@PathVariable Long challengeId) {
        challengeService.deleteChallenge(challengeId);
    }
}
