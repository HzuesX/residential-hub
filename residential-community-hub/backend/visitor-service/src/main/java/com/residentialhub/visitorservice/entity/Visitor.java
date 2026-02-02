package com.residentialhub.visitorservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "visitors", schema = "public")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Visitor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(nullable = false, length = 200)
    private String purpose;

    @Column(name = "host_id", nullable = false)
    private String hostId;

    @Column(name = "host_name", length = 100)
    private String hostName;

    @Column(name = "host_apartment", length = 50)
    private String hostApartment;

    @Column(name = "entry_time")
    private LocalDateTime entryTime;

    @Column(name = "exit_time")
    private LocalDateTime exitTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private VisitorStatus status = VisitorStatus.PENDING;

    @Column(name = "vehicle_number", length = 20)
    private String vehicleNumber;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(name = "qr_code", length = 500)
    private String qrCode;

    @Column(name = "society_id", nullable = false)
    private String societyId;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "checked_in_by")
    private String checkedInBy;

    @Column(name = "checked_out_by")
    private String checkedOutBy;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum VisitorStatus {
        PENDING, APPROVED, REJECTED, CHECKED_IN, CHECKED_OUT
    }
}
