package pl.relay.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.ExchangeFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

class StravaTokenServiceTest {

    @Test
    void shouldReturnSameUserWhenAccessTokenIsStillValid() {
        var userRepository = mock(UserRepository.class);
        var webClient = WebClient.builder()
                .exchangeFunction(request -> Mono.error(new IllegalStateException("Refresh should not be called.")))
                .build();

        var stravaTokenService = new StravaTokenService(userRepository, webClient);
        ReflectionTestUtils.setField(stravaTokenService, "stravaClientId", "client-id");
        ReflectionTestUtils.setField(stravaTokenService, "stravaClientSecret", "client-secret");

        var user = User.builder()
                .id(1L)
                .accessToken("valid-access-token")
                .refreshToken("refresh-token")
                .tokenExpiresAt(Instant.now().plusSeconds(3600))
                .build();

        var result = stravaTokenService.ensureValidAccessToken(user);

        assertThat(result).isSameAs(user);
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldRefreshExpiredAccessToken() {
        var userRepository = mock(UserRepository.class);
        var webClient = WebClient.builder()
                .exchangeFunction(tokenRefreshResponse())
                .build();

        var stravaTokenService = new StravaTokenService(userRepository, webClient);
        ReflectionTestUtils.setField(stravaTokenService, "stravaClientId", "client-id");
        ReflectionTestUtils.setField(stravaTokenService, "stravaClientSecret", "client-secret");

        var user = User.builder()
                .id(2L)
                .accessToken("expired-access-token")
                .refreshToken("old-refresh-token")
                .tokenExpiresAt(Instant.now().minusSeconds(300))
                .build();

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = stravaTokenService.ensureValidAccessToken(user);

        assertThat(result.getAccessToken()).isEqualTo("new-access-token");
        assertThat(result.getRefreshToken()).isEqualTo("new-refresh-token");
        assertThat(result.getTokenExpiresAt()).isEqualTo(Instant.ofEpochSecond(2_000_000_000L));
        verify(userRepository).save(user);
    }

    private ExchangeFunction tokenRefreshResponse() {
        return request -> {
            assertThat(request.method().name()).isEqualTo("POST");
            assertThat(request.url().toString()).isEqualTo("https://www.strava.com/oauth/token");
            assertThat(request.headers().getFirst(HttpHeaders.CONTENT_TYPE))
                    .startsWith(MediaType.APPLICATION_FORM_URLENCODED_VALUE);

            var responseBody = """
                    {
                      "access_token":"new-access-token",
                      "refresh_token":"new-refresh-token",
                      "expires_at":2000000000
                    }
                    """;

            return Mono.just(ClientResponse.create(HttpStatus.OK)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .body(responseBody)
                    .build());
        };
    }
}
