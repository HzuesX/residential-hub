package com.residentialhub.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class TenantFilter extends AbstractGatewayFilterFactory<TenantFilter.Config> {

    public TenantFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            
            // Extract tenant from header or subdomain
            String tenantId = extractTenantId(request);
            
            if (tenantId != null && !tenantId.isEmpty()) {
                // Add tenant ID to request headers for downstream services
                ServerHttpRequest modifiedRequest = request.mutate()
                    .header("X-Tenant-Id", tenantId)
                    .build();
                
                log.debug("Tenant identified: {}", tenantId);
                
                return chain.filter(exchange.mutate().request(modifiedRequest).build());
            }
            
            // Continue without tenant for public endpoints
            return chain.filter(exchange);
        };
    }

    private String extractTenantId(ServerHttpRequest request) {
        // Priority 1: X-Tenant-Id header
        String tenantId = request.getHeaders().getFirst("X-Tenant-Id");
        if (tenantId != null && !tenantId.isEmpty()) {
            return tenantId;
        }
        
        // Priority 2: Extract from subdomain (e.g., tenant1.residentialhub.com)
        String host = request.getHeaders().getFirst("Host");
        if (host != null && host.contains(".")) {
            String subdomain = host.substring(0, host.indexOf("."));
            if (!subdomain.equals("www") && !subdomain.equals("api") && !subdomain.equals("app")) {
                return subdomain;
            }
        }
        
        // Priority 3: Extract from path parameter
        String path = request.getURI().getPath();
        if (path.contains("/society/")) {
            String[] parts = path.split("/");
            for (int i = 0; i < parts.length - 1; i++) {
                if (parts[i].equals("society") && i + 1 < parts.length) {
                    return parts[i + 1];
                }
            }
        }
        
        return null;
    }

    public static class Config {
        // Configuration properties if needed
    }
}
