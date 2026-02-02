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
public class VisitorEvent {
    private String visitorId;
    private String visitorName;
    private String hostId;
    private String societyId;
    private String status;
    private String eventType;
    private LocalDateTime timestamp;
}
