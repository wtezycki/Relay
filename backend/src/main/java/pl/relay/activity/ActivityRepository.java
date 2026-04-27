package pl.relay.activity;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    boolean existsByStravaActivityId(Long stravaActivityId);

    List<Activity> findAllByOrderByIdDesc();
}
