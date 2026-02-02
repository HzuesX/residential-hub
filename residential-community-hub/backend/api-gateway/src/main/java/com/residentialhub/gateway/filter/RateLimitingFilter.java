package com.residentialhub.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;

@Component
@Slf4j
public class RateLimitingFilter extends AbstractGatewayFilterFactory<RateLimitingFilter.Config> {

    @Autowired
    private ReactiveStringRedisTemplate redisTemplate;

    // Rate limit: 100 requests per minute per user/IP
    private static final int REQUEST_LIMIT = 100;
    private static final Duration WINDOW = Duration.ofMinutes(1);

    // Lua script for atomic rate limiting
    private static final String RATE_LIMIT_SCRIPT = 
        "local key = KEYS[1] " +
        "local limit = tonumber(ARGV[1]) " +
        "local window = tonumber(ARGV[2]) " +
        "local current = redis.call('GET', key) " +
        "if current == false then " +
        "    redis.call('SETEX', key, window, 1) " +
        "    return 1 " +
        "end " +
        "current = tonumber(current) " +
        "if current >= limit then " +
        "    return 0 " +
        "else " +
        "    redis.call('INCR', key) " +
        "    return 1 " +
        "end";

    private final RedisScript<Long> rateLimitScript;

    public RateLimitingFilter() {
        super(Config.class);
        this.rateLimitScript = RedisScript.of(RATE_LIMIT_SCRIPT, Long.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String key = generateRateLimitKey(exchange);
            List<String> keys = Arrays.asList(key);
            List<String> args = Arrays.asList(
                String.valueOf(REQUEST_LIMIT),
                String.valueOf(WINDOW.getSeconds())
            );

            return redisTemplate.execute(rateLimitScript, keys, args)
                .next()
                .flatMap(allowed -> {
                    if (allowed == 1) {
                        return chain.filter(exchange);
                    } else {
                        return onRateLimitExceeded(exchange);
                    }
                })
                .onErrorResume(e -> {
                    log.error("Rate limiting error: {}", e.getMessage());
                    // Allow request on Redis failure (fail open)
                    return chain.filter(exchange);
                });
        };
    }

    private String generateRateLimitKey(org.springframework.web.server.ServerWebExchange exchange) {
        org.springframework.http.server.reactive.ServerHttpRequest request = exchange.getRequest();
        
        // Use user ID if available, otherwise use IP
        String userId = request.getHeaders().getFirst("X-User-Id");
        if (userId != null && !userId.isEmpty()) {
            return "rate_limit:user:" + userId;
        }
        
        // Fall back to IP address
        String clientIp = request.getRemoteAddress() != null 
            ? request.getRemoteAddress().getAddress().getHostAddress() 
            : "unknown";
        return "rate_limit:ip:" + clientIp;
    }

    private Mono<Void> onRateLimitExceeded(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        response.getHeaders().add("X-RateLimit-Limit", String.valueOf(REQUEST_LIMIT));
        response.getHeaders().add("Retry-After", String.valueOf(WINDOW.getSeconds()));
        return response.setComplete();
    }

    public static class Config {
        private int limit = 100;
        private int windowSeconds = 60;

        public int getLimit() { return limit; }
        public void setLimit(int limit) { this.limit = limit; }
        public int getWindowSeconds() { return windowSeconds; }
        public void setWindowSeconds(int windowSeconds) { this.windowSeconds = windowSeconds; }
    }
}
