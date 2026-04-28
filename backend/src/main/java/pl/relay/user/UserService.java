package pl.relay.user;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pl.relay.activity.ActivityService;
import pl.relay.user.dto.UserResponse;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ActivityService activityService;

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(OAuth2User oAuth2User) {
        if (oAuth2User == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated.");
        }

        var stravaAthleteId = extractStravaAthleteId(oAuth2User.getAttributes());
        var user = userRepository.findByStravaAthleteId(stravaAthleteId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        int streak = activityService.calculateConsistencyStreak(user.getId());

        return new UserResponse(
                user.getId(),
                user.getStravaAthleteId(),
                user.getFirstName(),
                user.getLastName(),
                user.getAvatarUrl(),
                user.getRole() == null ? UserRole.USER : user.getRole(),
                streak
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

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user does not contain a Strava athlete id.");
    }
}
