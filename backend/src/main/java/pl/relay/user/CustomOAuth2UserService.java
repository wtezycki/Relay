package pl.relay.user;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User>, AuthenticationSuccessHandler {

    private static final String STRAVA_REGISTRATION_ID = "strava";

    private final UserRepository userRepository;
    private final OAuth2AuthorizedClientService authorizedClientService;
    private final DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
    private final SavedRequestAwareAuthenticationSuccessHandler successHandler = new SavedRequestAwareAuthenticationSuccessHandler();

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        var oauth2User = delegate.loadUser(userRequest);

        if (isStravaLogin(userRequest.getClientRegistration().getRegistrationId())) {
            var attributes = getStravaAttributes(userRequest, oauth2User);
            validateStravaAthlete(attributes);
            return new DefaultOAuth2User(oauth2User.getAuthorities(), attributes, "id");
        }

        return oauth2User;
    }

    @Override
    @Transactional
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        if (authentication instanceof OAuth2AuthenticationToken oauth2Authentication
                && isStravaLogin(oauth2Authentication.getAuthorizedClientRegistrationId())) {
            var authorizedClient = authorizedClientService.loadAuthorizedClient(
                    oauth2Authentication.getAuthorizedClientRegistrationId(),
                    oauth2Authentication.getName()
            );

            saveOrUpdateStravaUser(oauth2Authentication.getPrincipal(), authorizedClient);
        }

        successHandler.onAuthenticationSuccess(request, response, authentication);
    }

    private void saveOrUpdateStravaUser(OAuth2User oauth2User, OAuth2AuthorizedClient authorizedClient) {
        if (authorizedClient == null) {
            throw stravaAuthenticationException("Missing authorized Strava client.");
        }

        var attributes = oauth2User.getAttributes();
        var stravaAthleteId = getRequiredLong(attributes, "id");
        var accessToken = authorizedClient.getAccessToken();
        var refreshToken = authorizedClient.getRefreshToken();

        var user = userRepository.findByStravaAthleteId(stravaAthleteId)
                .map(existingUser -> updateUser(existingUser, attributes, accessToken, refreshToken))
                .orElseGet(() -> createUser(attributes, accessToken, refreshToken));

        userRepository.save(user);
    }

    private User createUser(
            Map<String, Object> attributes,
            OAuth2AccessToken accessToken,
            OAuth2RefreshToken refreshToken
    ) {
        if (refreshToken == null) {
            throw stravaAuthenticationException("Missing Strava refresh token for a new user.");
        }

        return User.builder()
                .stravaAthleteId(getRequiredLong(attributes, "id"))
                .firstName(getRequiredString(attributes, "firstname"))
                .lastName(getRequiredString(attributes, "lastname"))
                .avatarUrl(getOptionalString(attributes, "profile"))
                .accessToken(accessToken.getTokenValue())
                .refreshToken(refreshToken.getTokenValue())
                .tokenExpiresAt(getRequiredExpiresAt(accessToken))
                .build();
    }

    private User updateUser(
            User user,
            Map<String, Object> attributes,
            OAuth2AccessToken accessToken,
            OAuth2RefreshToken refreshToken
    ) {
        user.setFirstName(getRequiredString(attributes, "firstname"));
        user.setLastName(getRequiredString(attributes, "lastname"));
        user.setAvatarUrl(getOptionalString(attributes, "profile"));
        user.setAccessToken(accessToken.getTokenValue());
        user.setTokenExpiresAt(getRequiredExpiresAt(accessToken));

        Optional.ofNullable(refreshToken)
                .map(OAuth2RefreshToken::getTokenValue)
                .ifPresent(user::setRefreshToken);

        return user;
    }

    private void validateStravaAthlete(Map<String, Object> attributes) {
        getRequiredLong(attributes, "id");
        getRequiredString(attributes, "firstname");
        getRequiredString(attributes, "lastname");
    }

    private Map<String, Object> getStravaAttributes(OAuth2UserRequest userRequest, OAuth2User oauth2User) {
        var athlete = userRequest.getAdditionalParameters().get("athlete");
        if (!(athlete instanceof Map<?, ?> athleteAttributes)) {
            return oauth2User.getAttributes();
        }

        var attributes = new LinkedHashMap<String, Object>();
        athleteAttributes.forEach((key, value) -> {
            if (key instanceof String attributeName) {
                attributes.put(attributeName, value);
            }
        });

        return attributes.isEmpty() ? oauth2User.getAttributes() : attributes;
    }

    private boolean isStravaLogin(String registrationId) {
        return STRAVA_REGISTRATION_ID.equals(registrationId);
    }

    private Long getRequiredLong(Map<String, Object> attributes, String key) {
        var value = attributes.get(key);
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String text && !text.isBlank()) {
            return Long.parseLong(text);
        }
        throw stravaAuthenticationException("Missing required Strava attribute: " + key);
    }

    private String getRequiredString(Map<String, Object> attributes, String key) {
        var value = getOptionalString(attributes, key);
        if (value == null || value.isBlank()) {
            throw stravaAuthenticationException("Missing required Strava attribute: " + key);
        }
        return value;
    }

    private String getOptionalString(Map<String, Object> attributes, String key) {
        var value = attributes.get(key);
        return value == null ? null : value.toString();
    }

    private Instant getRequiredExpiresAt(OAuth2AccessToken accessToken) {
        var expiresAt = accessToken.getExpiresAt();
        if (expiresAt == null) {
            throw stravaAuthenticationException("Missing Strava access token expiration.");
        }
        return expiresAt;
    }

    private OAuth2AuthenticationException stravaAuthenticationException(String message) {
        var error = new OAuth2Error("invalid_strava_user", message, null);
        return new OAuth2AuthenticationException(error, message);
    }
}
