package com.residentialhub.visitorservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitorDto {
    private String id;
    private String name;
    private String phone;
    private String email;
    private String purpose;
    private String hostId;
    private String hostName;
    private String hostApartment;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private String status;
    private String vehicleNumber;
    private String photoUrl;
    private String qrCode;
    private String societyId;
    private String approvedBy;
    private LocalDateTime approvedAt;
    private String checkedInBy;
    private String checkedOutBy;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
