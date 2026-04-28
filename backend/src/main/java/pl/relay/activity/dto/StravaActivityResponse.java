package pl.relay.activity.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

@JsonIgnoreProperties(ignoreUnknown = true)
public record StravaActivityResponse(
        Long id,
        String name,
        String type,
        double distance,
        @JsonProperty("moving_time") long movingTime,
        @JsonProperty("start_date") Instant startDate
) {
}
