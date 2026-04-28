package pl.relay.core;

import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityApiErrorHandlingTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnJsonUnauthorizedForAnonymousApiRequest() throws Exception {
        mockMvc.perform(get("/api/activities"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("Unauthorized")))
                .andExpect(jsonPath("$.message", is("Authentication is required.")))
                .andExpect(jsonPath("$.path", is("/api/activities")));
    }

    @Test
    void shouldReturnJsonForbiddenForNonAdminProtectedApiRequest() throws Exception {
        mockMvc.perform(post("/api/admin/sync").with(user("user").roles("USER")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)))
                .andExpect(jsonPath("$.error", is("Forbidden")))
                .andExpect(jsonPath("$.message", is("You do not have permission to access this resource.")))
                .andExpect(jsonPath("$.path", is("/api/admin/sync")));
    }
}
