package com.snapeat.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppProperties {
	private String name = "SnapEat";
    private String frontendUrl = "http://localhost:5173";
    private String supportEmail = "";
    
    private final Jwt jwt = new Jwt();

    @Getter
    @Setter
    public static class Jwt {
        private String secret;
        private long expirationMs = 86400000L;
        private long resetTokenExpiryMs = 3600000L;
    }
}
