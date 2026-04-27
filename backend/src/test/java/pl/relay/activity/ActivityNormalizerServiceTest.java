package pl.relay.activity;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ActivityNormalizerServiceTest {

    private final ActivityNormalizerService activityNormalizerService = new ActivityNormalizerService();

    @Test
    void shouldCalculateOneTeamPointPerFullKilometerForRunning() {
        var points = activityNormalizerService.calculateTeamPoints("Run", 5_750, 1_800);

        assertThat(points).isEqualTo(5);
    }

    @Test
    void shouldCalculateOneTeamPointPerFullKilometerForWalking() {
        var points = activityNormalizerService.calculateTeamPoints("Walk", 2_000, 3_600);

        assertThat(points).isEqualTo(2);
    }

    @Test
    void shouldCalculateOneTeamPointPerFullKilometerForCycling() {
        var points = activityNormalizerService.calculateTeamPoints("Ride", 41_999.9, 7_200);

        assertThat(points).isEqualTo(41);
    }

    @Test
    void shouldCalculateTwoTeamPointsPerFullFifteenMinutesForYoga() {
        var points = activityNormalizerService.calculateTeamPoints("Yoga", 0, 45 * 60);

        assertThat(points).isEqualTo(6);
    }

    @Test
    void shouldCalculateTwoTeamPointsPerFullFifteenMinutesForWeightlifting() {
        var points = activityNormalizerService.calculateTeamPoints("WeightTraining", 0, 44 * 60 + 59);

        assertThat(points).isEqualTo(4);
    }

    @Test
    void shouldCalculateTwoTeamPointsPerFullFifteenMinutesForSwimming() {
        var points = activityNormalizerService.calculateTeamPoints("Swim", 600, 30 * 60);

        assertThat(points).isEqualTo(4);
    }

    @Test
    void shouldReturnZeroForDistanceBelowOneFullKilometer() {
        var points = activityNormalizerService.calculateTeamPoints("Run", 999.9, 3_600);

        assertThat(points).isZero();
    }

    @Test
    void shouldReturnZeroForTimeBelowOneFullFifteenMinuteBlock() {
        var points = activityNormalizerService.calculateTeamPoints("Yoga", 0, 14 * 60 + 59);

        assertThat(points).isZero();
    }

    @Test
    void shouldNormalizeActivityTypeFormatting() {
        var points = activityNormalizerService.calculateTeamPoints("mountain_bike-ride", 12_000, 0);

        assertThat(points).isEqualTo(12);
    }

    @Test
    void shouldUseDistanceForUnknownActivityWhenDistanceIsAvailable() {
        var points = activityNormalizerService.calculateTeamPoints("Kayaking", 3_500, 5_400);

        assertThat(points).isEqualTo(3);
    }

    @Test
    void shouldUseMovingTimeForUnknownActivityWithoutDistance() {
        var points = activityNormalizerService.calculateTeamPoints("Pilates", 0, 30 * 60);

        assertThat(points).isEqualTo(4);
    }

    @Test
    void shouldReturnZeroForInvalidNegativeInputs() {
        var distancePoints = activityNormalizerService.calculateTeamPoints("Run", -1, -1);
        var timePoints = activityNormalizerService.calculateTeamPoints("Yoga", -1, -1);

        assertThat(distancePoints).isZero();
        assertThat(timePoints).isZero();
    }
}
