package pl.relay.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.server.ResponseStatusException;

class UserServiceTest {

    @Test
    void shouldReturnCurrentUserForAuthenticatedStravaPrincipal() {
        var userRepository = mock(UserRepository.class);
        var userService = new UserService(userRepository);

        var oAuth2User = createOAuth2User(Map.of("id", 12345L));
        var user = User.builder()
                .id(5L)
                .stravaAthleteId(12345L)
                .firstName("Jan")
                .lastName("Kowalski")
                .avatarUrl("https://example.com/avatar.png")
                .build();

        when(userRepository.findByStravaAthleteId(12345L)).thenReturn(Optional.of(user));

        var response = userService.getCurrentUser(oAuth2User);

        assertThat(response.id()).isEqualTo(5L);
        assertThat(response.stravaAthleteId()).isEqualTo(12345L);
        assertThat(response.firstName()).isEqualTo("Jan");
        assertThat(response.lastName()).isEqualTo("Kowalski");
        assertThat(response.avatarUrl()).isEqualTo("https://example.com/avatar.png");
    }

    @Test
    void shouldRejectMissingAuthenticatedUser() {
        var userRepository = mock(UserRepository.class);
        var userService = new UserService(userRepository);

        assertThatThrownBy(() -> userService.getCurrentUser(null))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(exception -> assertThat(((ResponseStatusException) exception).getStatusCode())
                        .isEqualTo(HttpStatus.UNAUTHORIZED));
    }

    @Test
    void shouldRejectAuthenticatedUserWithoutStravaId() {
        var userRepository = mock(UserRepository.class);
        var userService = new UserService(userRepository);

        var oAuth2User = createOAuth2User(Map.of("firstname", "Jan"));

        assertThatThrownBy(() -> userService.getCurrentUser(oAuth2User))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(exception -> assertThat(((ResponseStatusException) exception).getStatusCode())
                        .isEqualTo(HttpStatus.UNAUTHORIZED));
    }

    private OAuth2User createOAuth2User(Map<String, Object> attributes) {
        return new DefaultOAuth2User(List.of(), attributes, attributes.keySet().iterator().next());
    }
}
