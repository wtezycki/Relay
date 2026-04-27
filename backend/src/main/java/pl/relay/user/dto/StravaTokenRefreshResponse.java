package pl.relay.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record StravaTokenRefreshResponse(
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("refresh_token") String refreshToken,
        @JsonProperty("expires_at") long expiresAt
) {
}
