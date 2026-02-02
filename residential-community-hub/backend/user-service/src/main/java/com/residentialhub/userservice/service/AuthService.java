package com.residentialhub.userservice.service;

import com.residentialhub.userservice.dto.*;
import com.residentialhub.userservice.entity.User;
import com.residentialhub.userservice.exception.AuthenticationException;
import com.residentialhub.userservice.exception.ResourceNotFoundException;
import com.residentialhub.userservice.repository.UserRepository;
import com.residentialhub.userservice.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisTemplate<String, String> redisTemplate;
    private final RabbitTemplate rabbitTemplate;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for user: {}", request.getUsername());

        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new AuthenticationException("Invalid credentials"));

        if (!user.getIsActive()) {
            throw new AuthenticationException("Account is deactivated");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthenticationException("Invalid credentials");
        }

        // Update last login
        user.setLastLoginAt(LocalDateTime.now());
        
        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);
        
        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
        userRepository.save(user);

        // Cache token in Redis
        cacheToken(user.getId(), accessToken);

        // Publish login event
        publishLoginEvent(user);

        log.info("User {} logged in successfully", user.getUsername());

        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(jwtExpiration / 1000)
            .user(mapToUserResponse(user))
            .build();
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        log.info("Token refresh attempt");

        if (!jwtTokenProvider.validateToken(request.getRefreshToken())) {
            throw new AuthenticationException("Invalid refresh token");
        }

        User user = userRepository.findByRefreshToken(request.getRefreshToken())
            .orElseThrow(() -> new AuthenticationException("Invalid refresh token"));

        if (user.getRefreshTokenExpiry() == null || 
            user.getRefreshTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new AuthenticationException("Refresh token expired");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);

        user.setRefreshToken(newRefreshToken);
        user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(7));
        userRepository.save(user);

        cacheToken(user.getId(), accessToken);

        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(newRefreshToken)
            .tokenType("Bearer")
            .expiresIn(jwtExpiration / 1000)
            .user(mapToUserResponse(user))
            .build();
    }

    @Transactional
    public void logout(String userId, String token) {
        log.info("Logout for user: {}", userId);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setRefreshToken(null);
        user.setRefreshTokenExpiry(null);
        userRepository.save(user);

        // Remove from cache
        removeCachedToken(userId);
        
        // Blacklist token
        blacklistToken(token);

        log.info("User {} logged out successfully", user.getUsername());
    }

    public boolean validateToken(String token) {
        if (isTokenBlacklisted(token)) {
            return false;
        }
        return jwtTokenProvider.validateToken(token);
    }

    private void cacheToken(String userId, String token) {
        try {
            redisTemplate.opsForValue().set(
                "token:" + userId, 
                token, 
                jwtExpiration, 
                TimeUnit.MILLISECONDS
            );
        } catch (Exception e) {
            log.warn("Failed to cache token: {}", e.getMessage());
        }
    }

    private void removeCachedToken(String userId) {
        try {
            redisTemplate.delete("token:" + userId);
        } catch (Exception e) {
            log.warn("Failed to remove cached token: {}", e.getMessage());
        }
    }

    private void blacklistToken(String token) {
        try {
            Claims claims = jwtTokenProvider.extractAllClaims(token);
            long expiration = claims.getExpiration().getTime() - System.currentTimeMillis();
            if (expiration > 0) {
                redisTemplate.opsForValue().set(
                    "blacklist:" + token, 
                    "true", 
                    expiration, 
                    TimeUnit.MILLISECONDS
                );
            }
        } catch (Exception e) {
            log.warn("Failed to blacklist token: {}", e.getMessage());
        }
    }

    private boolean isTokenBlacklisted(String token) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey("blacklist:" + token));
        } catch (Exception e) {
            return false;
        }
    }

    private void publishLoginEvent(User user) {
        try {
            LoginEvent event = LoginEvent.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .societyId(user.getSocietyId())
                .timestamp(LocalDateTime.now())
                .build();
            
            rabbitTemplate.convertAndSend("auth.exchange", "auth.login", event);
        } catch (Exception e) {
            log.warn("Failed to publish login event: {}", e.getMessage());
        }
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .userId(user.getUserId())
            .username(user.getUsername())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .fullName(user.getFullName())
            .phone(user.getPhone())
            .profilePhotoUrl(user.getProfilePhotoUrl())
            .role(user.getRole().name())
            .apartmentNumber(user.getApartmentNumber())
            .buildingName(user.getBuildingName())
            .societyId(user.getSocietyId())
            .isActive(user.getIsActive())
            .emailVerified(user.getEmailVerified())
            .phoneVerified(user.getPhoneVerified())
            .permissions(user.getPermissions())
            .lastLoginAt(user.getLastLoginAt())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
