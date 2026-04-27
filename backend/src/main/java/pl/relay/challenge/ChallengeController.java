package pl.relay.challenge;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/challenge")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;

    @GetMapping("/current")
    public ChallengeResponse getCurrentChallenge() {
        return challengeService.getCurrentChallenge();
    }

    @PostMapping
    public ChallengeResponse createChallenge(@RequestBody ChallengeCreateRequest request) {
        return challengeService.createChallenge(request);
    }
}
