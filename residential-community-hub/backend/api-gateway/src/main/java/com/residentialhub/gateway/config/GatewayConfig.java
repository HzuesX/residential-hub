package com.residentialhub.gateway.config;

import com.residentialhub.gateway.filter.AuthenticationFilter;
import com.residentialhub.gateway.filter.TenantFilter;
import com.residentialhub.gateway.filter.RateLimitingFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Autowired
    private AuthenticationFilter authFilter;

    @Autowired
    private TenantFilter tenantFilter;

    @Autowired
    private RateLimitingFilter rateLimitingFilter;

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            // User Service Routes
            .route("user-service", r -> r.path("/api/v1/users/**", "/api/v1/auth/**", "/api/v1/societies/**")
                .filters(f -> f
                    .filter(rateLimitingFilter.apply(new RateLimitingFilter.Config()))
                    .filter(tenantFilter.apply(new TenantFilter.Config()))
                    .filter(authFilter.apply(new AuthenticationFilter.Config()))
                    .stripPrefix(0))
                .uri("lb://user-service"))
            
            // Visitor Service Routes
            .route("visitor-service", r -> r.path("/api/v1/visitors/**", "/api/v1/invites/**")
                .filters(f -> f
                    .filter(rateLimitingFilter.apply(new RateLimitingFilter.Config()))
                    .filter(tenantFilter.apply(new TenantFilter.Config()))
                    .filter(authFilter.apply(new AuthenticationFilter.Config()))
                    .stripPrefix(0))
                .uri("lb://visitor-service"))
            
            // Maintenance Service Routes
            .route("maintenance-service", r -> r.path("/api/v1/maintenance/**", "/api/v1/vendors/**")
                .filters(f -> f
                    .filter(rateLimitingFilter.apply(new RateLimitingFilter.Config()))
                    .filter(tenantFilter.apply(new TenantFilter.Config()))
                    .filter(authFilter.apply(new AuthenticationFilter.Config()))
                    .stripPrefix(0))
                .uri("lb://maintenance-service"))
            
            // Notification Service Routes
            .route("notification-service", r -> r.path("/api/v1/notifications/**")
                .filters(f -> f
                    .filter(rateLimitingFilter.apply(new RateLimitingFilter.Config()))
                    .filter(tenantFilter.apply(new TenantFilter.Config()))
                    .filter(authFilter.apply(new AuthenticationFilter.Config()))
                    .stripPrefix(0))
                .uri("lb://notification-service"))
            
            // Analytics Service Routes
            .route("analytics-service", r -> r.path("/api/v1/analytics/**", "/api/v1/reports/**")
                .filters(f -> f
                    .filter(rateLimitingFilter.apply(new RateLimitingFilter.Config()))
                    .filter(tenantFilter.apply(new TenantFilter.Config()))
                    .filter(authFilter.apply(new AuthenticationFilter.Config()))
                    .stripPrefix(0))
                .uri("lb://analytics-service"))
            
            // Audit Service Routes
            .route("audit-service", r -> r.path("/api/v1/audit/**", "/api/v1/logs/**")
                .filters(f -> f
                    .filter(rateLimitingFilter.apply(new RateLimitingFilter.Config()))
                    .filter(tenantFilter.apply(new TenantFilter.Config()))
                    .filter(authFilter.apply(new AuthenticationFilter.Config()))
                    .stripPrefix(0))
                .uri("lb://audit-service"))
            
            // Payment Service Routes
            .route("payment-service", r -> r.path("/api/v1/payments/**", "/api/v1/subscriptions/**", "/api/v1/billing/**")
                .filters(f -> f
                    .filter(rateLimitingFilter.apply(new RateLimitingFilter.Config()))
                    .filter(tenantFilter.apply(new TenantFilter.Config()))
                    .filter(authFilter.apply(new AuthenticationFilter.Config()))
                    .stripPrefix(0))
                .uri("lb://payment-service"))
            
            // Social Service Routes
            .route("social-service", r -> r.path("/api/v1/social/**", "/api/v1/posts/**", "/api/v1/messages/**")
                .filters(f -> f
                    .filter(rateLimitingFilter.apply(new RateLimitingFilter.Config()))
                    .filter(tenantFilter.apply(new TenantFilter.Config()))
                    .filter(authFilter.apply(new AuthenticationFilter.Config()))
                    .stripPrefix(0))
                .uri("lb://social-service"))
            
            .build();
    }
}
