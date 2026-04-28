package pl.relay.core;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import pl.relay.user.CustomOAuth2UserService;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private static final List<String> ALLOWED_METHODS = List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");

    private final CustomOAuth2UserService customOAuth2UserService;

    @Value("${relay.cors.allowed-origin:http://localhost:5173}")
    private String allowedOrigin;

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            @Value("${relay.frontend.base-url:http://localhost:5173}") String frontendBaseUrl
    ) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/", "/login/**", "/oauth2/**", "/error").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/challenge").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/challenge/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/challenge/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/challenge/**").hasRole("ADMIN")
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                        .successHandler(customOAuth2UserService)
                )
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .defaultAuthenticationEntryPointFor(
                                (request, response, exception) -> writeApiError(
                                        request,
                                        response,
                                        HttpStatus.UNAUTHORIZED,
                                        "Authentication is required."
                                ),
                                request -> request.getRequestURI().startsWith("/api/")
                        )
                        .defaultAccessDeniedHandlerFor(
                                (request, response, exception) -> writeApiError(
                                        request,
                                        response,
                                        HttpStatus.FORBIDDEN,
                                        "You do not have permission to access this resource."
                                ),
                                request -> request.getRequestURI().startsWith("/api/")
                        )
                )
                .logout(logout -> logout
                        .logoutRequestMatcher(request ->
                                "GET".equals(request.getMethod()) && "/logout".equals(request.getServletPath())
                        )
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                        .logoutSuccessHandler((request, response, authentication) -> response.sendRedirect(frontendBaseUrl))
                );

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        var configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(allowedOrigin));
        configuration.setAllowedMethods(ALLOWED_METHODS);
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private void writeApiError(
            HttpServletRequest request,
            HttpServletResponse response,
            HttpStatus status,
            String message
    ) throws java.io.IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        var payload = ApiErrorResponse.of(status.value(), status.getReasonPhrase(), message, request.getRequestURI());
        response.getWriter().write(toJson(payload));
    }

    private String toJson(ApiErrorResponse errorResponse) {
        return """
                {"timestamp":"%s","status":%d,"error":"%s","message":"%s","path":"%s"}
                """.formatted(
                errorResponse.timestamp(),
                errorResponse.status(),
                escapeJson(errorResponse.error()),
                escapeJson(errorResponse.message()),
                escapeJson(errorResponse.path())
        );
    }

    private String escapeJson(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"");
    }
}
