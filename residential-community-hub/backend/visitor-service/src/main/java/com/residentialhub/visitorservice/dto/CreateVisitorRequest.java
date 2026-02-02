package com.residentialhub.visitorservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateVisitorRequest {
    @NotBlank(message = "Visitor name is required")
    private String name;

    @NotBlank(message = "Phone number is required")
    private String phone;

    private String email;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    @NotNull(message = "Host ID is required")
    private String hostId;

    private String hostName;
    private String hostApartment;
    private String vehicleNumber;
    private String photoUrl;
    private String societyId;
}
