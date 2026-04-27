package pl.relay.user;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public UserResponse getCurrentUser(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No authenticated user.");
        }

        var stravaAthleteId = extractStravaAthleteId(principal.getAttributes());
        var user = userRepository.findByStravaAthleteId(stravaAthleteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Authenticated user not found."));

        return new UserResponse(
                user.getId(),
                user.getStravaAthleteId(),
                user.getFirstName(),
                user.getLastName(),
                user.getAvatarUrl()
        );
    }

    private Long extractStravaAthleteId(Map<String, Object> attributes) {
        var value = attributes.get("id");
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String text && !text.isBlank()) {
            return Long.parseLong(text);
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing Strava athlete id.");
    }
}
