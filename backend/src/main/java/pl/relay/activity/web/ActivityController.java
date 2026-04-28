package pl.relay.activity.web;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import pl.relay.activity.ActivityService;
import pl.relay.user.UserService;
import pl.relay.activity.dto.ActivityResponse;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;
    private final UserService userService;

    @GetMapping
    public List<ActivityResponse> getActivities() {
        return activityService.getActivities();
    }

    @PostMapping("/{activityId}/likes")
    public ActivityResponse toggleLike(@PathVariable Long activityId, @AuthenticationPrincipal OAuth2User oAuth2User) {
        var user = userService.getCurrentUser(oAuth2User);
        return activityService.toggleLike(activityId, user.id());
    }
}
