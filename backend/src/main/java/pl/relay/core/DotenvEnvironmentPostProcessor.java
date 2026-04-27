package pl.relay.core;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.StandardEnvironment;

public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String PROPERTY_SOURCE_NAME = "localDotenv";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        var dotenvFile = findDotenvFile();
        if (dotenvFile == null) {
            return;
        }

        var properties = readDotenvFile(dotenvFile, environment);
        if (properties.isEmpty()) {
            return;
        }

        var propertySource = new MapPropertySource(PROPERTY_SOURCE_NAME, properties);
        var propertySources = environment.getPropertySources();

        if (propertySources.contains(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME)) {
            propertySources.addAfter(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME, propertySource);
            return;
        }

        propertySources.addLast(propertySource);
    }

    private Path findDotenvFile() {
        var workingDirectory = Path.of(System.getProperty("user.dir")).toAbsolutePath().normalize();
        var candidates = List.of(
                workingDirectory.resolve(".env"),
                workingDirectory.resolve("backend/.env")
        );

        return candidates.stream()
                .filter(Files::isRegularFile)
                .findFirst()
                .orElse(null);
    }

    private Map<String, Object> readDotenvFile(Path dotenvFile, ConfigurableEnvironment environment) {
        var properties = new LinkedHashMap<String, Object>();

        try {
            for (var line : Files.readAllLines(dotenvFile, StandardCharsets.UTF_8)) {
                addProperty(line, properties, environment);
            }
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to read .env file: " + dotenvFile, exception);
        }

        return properties;
    }

    private void addProperty(String line, Map<String, Object> properties, ConfigurableEnvironment environment) {
        var trimmedLine = line.trim();
        if (trimmedLine.isBlank() || trimmedLine.startsWith("#")) {
            return;
        }

        var separatorIndex = trimmedLine.indexOf('=');
        if (separatorIndex <= 0) {
            return;
        }

        var key = trimmedLine.substring(0, separatorIndex).trim();
        if (environment.containsProperty(key)) {
            return;
        }

        var value = trimmedLine.substring(separatorIndex + 1).trim();
        properties.put(key, unquote(value));
    }

    private String unquote(String value) {
        if (value.length() < 2) {
            return value;
        }

        var firstCharacter = value.charAt(0);
        var lastCharacter = value.charAt(value.length() - 1);
        if ((firstCharacter == '"' && lastCharacter == '"') || (firstCharacter == '\'' && lastCharacter == '\'')) {
            return value.substring(1, value.length() - 1);
        }

        return value;
    }
}
