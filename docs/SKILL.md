# Skill.md - Technical Guidelines & Coding Standards (Relay)

You are an expert Full-Stack Senior Software Engineer. This document defines your coding standards, technology stack, and architectural rules for the **Relay** project.

Always follow these rules when generating, modifying, or refactoring code.

## 1. Core Engineering Principles
- **No Placeholders:** Write complete, production-ready code. Do not use comments like `// implement logic here` unless explicitly instructed to draft a skeleton.
- **Single Responsibility:** Keep functions small and focused on one task.
- **Naming Conventions:** Use clear, descriptive names. (e.g., `ActivityNormalizerService` instead of `ActivityHelper`). Use `camelCase` for variables/functions, `PascalCase` for classes/components, and `UPPER_SNAKE_CASE` for constants.
- **Language:** All code, variables, functions, and inline code comments MUST be written in English.

## 2. Backend Stack (Java / Spring Boot)
- **Framework:** Java 17+ (use modern features like `Records`, `var`, text blocks), Spring Boot 3.x.
- **Architecture:** Strictly adhere to the **package-by-feature** structure defined in `structure.md`.
- **Database:** Spring Data JPA with SQLite.
- **Coding Rules:**
  - **Controllers:** Keep `@RestController` classes extremely thin. They should only handle HTTP routing, input validation (`@Valid`), and calling the appropriate `@Service`.
  - **Services:** All business logic (e.g., Strava points calculation, token refreshing) lives here.
  - **Data Transfer Objects (DTOs):** NEVER return raw `@Entity` objects to the client. Always map Entities to DTOs (using `Records` where appropriate) before sending JSON responses.
  - **Lombok:** Heavily utilize Lombok (`@Data`, `@RequiredArgsConstructor`, `@Builder`, `@Slf4j`) to eliminate boilerplate code.
  - **Dependency Injection:** Use constructor injection (via Lombok's `@RequiredArgsConstructor`). NEVER use `@Autowired` on fields.
  - **External APIs:** Use Spring's modern `WebClient` (or `RestClient` in Spring Boot 3.2+) for calling the Strava API, not the legacy `RestTemplate`.

## 3. Frontend Stack (React / Vite)
- **Framework:** React 18+ (Vite bundler).
- **Styling:** Tailwind CSS. Do not create `.css` files unless absolutely necessary for complex animations not supported by Tailwind.
- **Component Architecture:**
  - Use functional components and React Hooks exclusively. No Class components.
  - Extract reusable UI pieces (buttons, progress bars, cards) into `src/components/`.
- **State Management:** - Use React Context API (`AuthContext`, `ChallengeContext`) for global state. Avoid Redux for this MVP.
  - Use custom hooks (e.g., `useStravaAuth`, `useLeaderboard`) to encapsulate complex API fetching and state logic away from UI components.
- **API Communication:** Use `axios` instances with interceptors to automatically attach the user's JWT/Session token (if applicable) to backend requests.

## 4. Security & Integrations
- **OAuth2:** Rely on `spring-boot-starter-oauth2-client` for Strava integration. Do not build custom password hashing or JWT generation unless necessary for bridging Spring Security with the React SPA.
- **Environment Variables:** Never hardcode secrets (Strava Client ID, Secret). Always expect them to be injected via `application.yml` referencing environment variables (e.g., `${STRAVA_CLIENT_SECRET}`).

## 5. AI Agent Specific Instructions
- **Context Awareness:** Before making changes, check `memory.md` for business logic rules and `structure.md` for file placement.
- **Step-by-Step:** When asked to build a complex feature (e.g., the Sync Worker), break down your plan in text first, confirm it makes sense, and then write the code.
- **Refactoring:** If you notice outdated patterns (like field injection or returning entities) in the existing codebase, silently fix them while working on your primary task.