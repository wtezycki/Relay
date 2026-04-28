package pl.relay.challenge;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChallengeRepository extends JpaRepository<Challenge, Long> {

    List<Challenge> findAllByIsActiveTrue();
}
