package pl.relay.user;

import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import pl.relay.user.dto.StravaTokenRefreshResponse;

@Service
@RequiredArgsConstructor
public class StravaTokenService {

    private static final long TOKEN_REFRESH_BUFFER_SECONDS = 60;

    private final UserRepository userRepository;
    private final WebClient stravaWebClient;

    @Value("${spring.security.oauth2.client.registration.strava.client-id}")
    private String stravaClientId;

    @Value("${spring.security.oauth2.client.registration.strava.client-secret}")
    private String stravaClientSecret;

    @Transactional
    public User ensureValidAccessToken(User user) {
        if (!isTokenExpiredOrExpiringSoon(user)) {
            return user;
        }

        var refreshResponse = refreshAccessToken(user.getRefreshToken());
        user.setAccessToken(refreshResponse.accessToken());
        user.setRefreshToken(refreshResponse.refreshToken());
        user.setTokenExpiresAt(Instant.ofEpochSecond(refreshResponse.expiresAt()));

        return userRepository.save(user);
    }

    private boolean isTokenExpiredOrExpiringSoon(User user) {
        var expiresAt = user.getTokenExpiresAt();
        return expiresAt == null || !expiresAt.isAfter(Instant.now().plusSeconds(TOKEN_REFRESH_BUFFER_SECONDS));
    }

    private StravaTokenRefreshResponse refreshAccessToken(String refreshToken) {
        return stravaWebClient.post()
                .uri("https://www.strava.com/oauth/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(refreshTokenRequest(refreshToken)))
                .retrieve()
                .bodyToMono(StravaTokenRefreshResponse.class)
                .blockOptional()
                .orElseThrow(() -> new IllegalStateException("Strava token refresh returned an empty response."));
    }

    private MultiValueMap<String, String> refreshTokenRequest(String refreshToken) {
        var formData = new LinkedMultiValueMap<String, String>();
        formData.add("client_id", stravaClientId);
        formData.add("client_secret", stravaClientSecret);
        formData.add("grant_type", "refresh_token");
        formData.add("refresh_token", refreshToken);
        return formData;
    }
}
