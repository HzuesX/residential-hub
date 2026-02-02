package com.residentialhub.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String phone;
    private String profilePhotoUrl;
    private String role;
    private String apartmentNumber;
    private String buildingName;
    private String societyId;
    private Boolean isActive;
    private Boolean emailVerified;
    private Boolean phoneVerified;
    private Set<String> permissions;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
}
