package pl.relay.activity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record StravaActivityResponse(
        Long id,
        String type,
        double distance,
        @JsonProperty("moving_time") long movingTime
) {
}
