# memory.md - Business Logic and Game Rules

This file contains the core business logic, gamification rules, and Strava integration guidelines for the Relay application. Always refer to these rules when writing backend code (Spring Boot) and managing state on the frontend (React).

## 1. The Global Challenge (Core State)
Unlike individual habit trackers, this app revolves around a SINGLE, shared company goal (e.g., "Run to Tokyo").
* **Challenge Entity:** There is only one active challenge at a time. It has a `target_points` (e.g., 8000) and `current_points` (aggregated from all users).
* **Milestones:** The challenge has intermediate milestones (e.g., at 1000, 2000, 5000 points) to provide frequent dopamine hits to the team.
* **Global Progress Bar:** The primary UI element on the Frontend is a massive progress bar showing the entire company's progress toward the goal.

## 2. Activity Normalization (Anti-Exclusion Logic)
To ensure no employee feels excluded (e.g., those who cannot run), ALL activities fetched from Strava are converted into a universal currency: **Team Points (TP)**.
* **Distance-based activities (Running, Walking, Cycling):** - Formula: `1 km = 1 Team Point`.
* **Time-based activities (Yoga, Weightlifting, Swimming):**
  - Strava returns duration (moving time) instead of distance.
  - Formula: `15 minutes of moving time = 2 Team Points`.
* **Rule:** The `ActivityNormalizerService` on the backend MUST apply these conversions before adding points to the Global Challenge.

## 3. Strava Sync Logic (The Cron Worker)
Users DO NOT manually add activities. Everything is automated to prevent cheating and reduce friction.
* **Scheduled Job:** A Spring `@Scheduled` task runs periodically (e.g., every 4 hours).
* **Fetch Logic:** It iterates through all active users, uses their stored Strava `access_token`, and fetches new activities from the `/athlete/activities` endpoint.
* **Idempotency:** The worker MUST save the `strava_activity_id` in the database to ensure the same activity is never counted twice.
* **Token Refresh:** If an `access_token` is expired (Strava tokens expire after 6 hours), the backend must automatically use the `refresh_token` to get a new one before fetching activities.

## 4. Streaks and Leaderboards (Healthy Gamification)
We avoid toxic "who ran the most" leaderboards. We reward consistency.
* **Consistency Streak:** A counter tracking how many consecutive days a user has logged AT LEAST ONE activity (duration > 15 mins or distance > 1 km).
* **Leaderboard UI:** The main ranking shows "Top Streaks" (most consistent users) rather than "Top Distance". This allows a daily walker to compete with a marathon runner.

## 5. Team Feed (Social Aspect)
A chronological feed of recent company activities to build momentum.
* **Data Structure:** Returns normalized strings to the frontend, e.g., `{"user": "Michał", "type": "Yoga", "points": 4, "time_ago": "2 hours ago"}`.
* **No Comments:** For the MVP, there is no comment system. Users can only click a simple "Kudos/Fire" icon next to an activity, which increments a basic counter in the database.

## 6. Authentication (MVP Scope)
* **Strict Rule:** DO NOT implement traditional email/password registration. 
* **Auth Flow:** Strava OAuth2 is the ONLY login method. When a user clicks "Login with Strava", the app creates a user profile using their Strava Athlete data (Name, Avatar) and stores their OAuth tokens.