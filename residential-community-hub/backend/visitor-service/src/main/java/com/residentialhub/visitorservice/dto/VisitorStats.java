package com.residentialhub.visitorservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitorStats {
    private Long pending;
    private Long approved;
    private Long checkedIn;
    private Long checkedOut;
    private Long thisWeek;
}
