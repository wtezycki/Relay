package pl.relay.activity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.JoinColumn;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "activities")
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long stravaActivityId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String userFirstName;

    @Column(nullable = false)
    private String userLastName;

    @Column(nullable = false)
    private Integer teamPoints;

    @Column(nullable = false)
    private String type;

    private String activityName;

    private Instant occurredAt;

    private Double distanceMeters;

    private Long movingTimeSeconds;

    @ElementCollection
    @CollectionTable(name = "activity_kudos", joinColumns = @JoinColumn(name = "activity_id"))
    @Column(name = "user_id")
    @Builder.Default
    private Set<Long> likedUserIds = new HashSet<>();
}
