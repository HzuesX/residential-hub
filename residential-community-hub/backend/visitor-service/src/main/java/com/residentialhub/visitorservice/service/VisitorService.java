package com.residentialhub.visitorservice.service;

import com.residentialhub.visitorservice.dto.*;
import com.residentialhub.visitorservice.entity.Visitor;
import com.residentialhub.visitorservice.exception.ResourceNotFoundException;
import com.residentialhub.visitorservice.repository.VisitorRepository;
import com.residentialhub.visitorservice.util.QrCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VisitorService {

    private final VisitorRepository visitorRepository;
    private final RabbitTemplate rabbitTemplate;
    private final QrCodeGenerator qrCodeGenerator;

    @Transactional
    public VisitorDto createVisitor(CreateVisitorRequest request, String createdBy) {
        log.info("Creating visitor entry for: {}", request.getName());

        Visitor visitor = Visitor.builder()
            .name(request.getName())
            .phone(request.getPhone())
            .email(request.getEmail())
            .purpose(request.getPurpose())
            .hostId(request.getHostId())
            .hostName(request.getHostName())
            .hostApartment(request.getHostApartment())
            .vehicleNumber(request.getVehicleNumber())
            .photoUrl(request.getPhotoUrl())
            .societyId(request.getSocietyId())
            .status(Visitor.VisitorStatus.PENDING)
            .build();

        Visitor saved = visitorRepository.save(visitor);

        // Generate QR Code
        String qrData = String.format("VISITOR:%s:%s:%s", saved.getId(), saved.getSocietyId(), saved.getPhone());
        String qrCodeBase64 = qrCodeGenerator.generateQrCode(qrData, 200, 200);
        saved.setQrCode(qrCodeBase64);
        visitorRepository.save(saved);

        // Publish notification event
        publishVisitorEvent(saved, "VISITOR_CREATED");

        log.info("Visitor created with ID: {}", saved.getId());
        return mapToDto(saved);
    }

    @Transactional
    public VisitorDto approveVisitor(String visitorId, String approvedBy) {
        log.info("Approving visitor: {}", visitorId);

        Visitor visitor = visitorRepository.findById(visitorId)
            .orElseThrow(() -> new ResourceNotFoundException("Visitor not found"));

        visitor.setStatus(Visitor.VisitorStatus.APPROVED);
        visitor.setApprovedBy(approvedBy);
        visitor.setApprovedAt(LocalDateTime.now());

        Visitor saved = visitorRepository.save(visitor);
        publishVisitorEvent(saved, "VISITOR_APPROVED");

        return mapToDto(saved);
    }

    @Transactional
    public VisitorDto rejectVisitor(String visitorId, String rejectedBy, String reason) {
        log.info("Rejecting visitor: {}", visitorId);

        Visitor visitor = visitorRepository.findById(visitorId)
            .orElseThrow(() -> new ResourceNotFoundException("Visitor not found"));

        visitor.setStatus(Visitor.VisitorStatus.REJECTED);
        visitor.setRejectionReason(reason);

        Visitor saved = visitorRepository.save(visitor);
        publishVisitorEvent(saved, "VISITOR_REJECTED");

        return mapToDto(saved);
    }

    @Transactional
    public VisitorDto checkIn(String visitorId, String checkedInBy) {
        log.info("Checking in visitor: {}", visitorId);

        Visitor visitor = visitorRepository.findById(visitorId)
            .orElseThrow(() -> new ResourceNotFoundException("Visitor not found"));

        visitor.setStatus(Visitor.VisitorStatus.CHECKED_IN);
        visitor.setEntryTime(LocalDateTime.now());
        visitor.setCheckedInBy(checkedInBy);

        Visitor saved = visitorRepository.save(visitor);
        publishVisitorEvent(saved, "VISITOR_CHECKED_IN");

        return mapToDto(saved);
    }

    @Transactional
    public VisitorDto checkOut(String visitorId, String checkedOutBy) {
        log.info("Checking out visitor: {}", visitorId);

        Visitor visitor = visitorRepository.findById(visitorId)
            .orElseThrow(() -> new ResourceNotFoundException("Visitor not found"));

        visitor.setStatus(Visitor.VisitorStatus.CHECKED_OUT);
        visitor.setExitTime(LocalDateTime.now());
        visitor.setCheckedOutBy(checkedOutBy);

        Visitor saved = visitorRepository.save(visitor);
        publishVisitorEvent(saved, "VISITOR_CHECKED_OUT");

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public VisitorDto getVisitor(String visitorId) {
        Visitor visitor = visitorRepository.findById(visitorId)
            .orElseThrow(() -> new ResourceNotFoundException("Visitor not found"));
        return mapToDto(visitor);
    }

    @Transactional(readOnly = true)
    public List<VisitorDto> getVisitorsBySociety(String societyId) {
        return visitorRepository.findBySocietyId(societyId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<VisitorDto> getVisitorsBySociety(String societyId, Pageable pageable) {
        return visitorRepository.findBySocietyId(societyId, pageable)
            .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public List<VisitorDto> getVisitorsByHost(String hostId) {
        return visitorRepository.findByHostId(hostId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VisitorDto> getTodayVisitors(String societyId) {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        
        return visitorRepository.findTodayVisitors(societyId, startOfDay, endOfDay)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VisitorStats getVisitorStats(String societyId) {
        Long pending = visitorRepository.countBySocietyIdAndStatus(societyId, Visitor.VisitorStatus.PENDING);
        Long approved = visitorRepository.countBySocietyIdAndStatus(societyId, Visitor.VisitorStatus.APPROVED);
        Long checkedIn = visitorRepository.countBySocietyIdAndStatus(societyId, Visitor.VisitorStatus.CHECKED_IN);
        Long checkedOut = visitorRepository.countBySocietyIdAndStatus(societyId, Visitor.VisitorStatus.CHECKED_OUT);
        
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        Long thisWeek = visitorRepository.countVisitorsSince(societyId, weekAgo);

        return VisitorStats.builder()
            .pending(pending != null ? pending : 0)
            .approved(approved != null ? approved : 0)
            .checkedIn(checkedIn != null ? checkedIn : 0)
            .checkedOut(checkedOut != null ? checkedOut : 0)
            .thisWeek(thisWeek != null ? thisWeek : 0)
            .build();
    }

    private void publishVisitorEvent(Visitor visitor, String eventType) {
        try {
            VisitorEvent event = VisitorEvent.builder()
                .visitorId(visitor.getId())
                .visitorName(visitor.getName())
                .hostId(visitor.getHostId())
                .societyId(visitor.getSocietyId())
                .status(visitor.getStatus().name())
                .eventType(eventType)
                .timestamp(LocalDateTime.now())
                .build();
            
            rabbitTemplate.convertAndSend("visitor.exchange", "visitor." + eventType.toLowerCase(), event);
        } catch (Exception e) {
            log.warn("Failed to publish visitor event: {}", e.getMessage());
        }
    }

    private VisitorDto mapToDto(Visitor visitor) {
        return VisitorDto.builder()
            .id(visitor.getId())
            .name(visitor.getName())
            .phone(visitor.getPhone())
            .email(visitor.getEmail())
            .purpose(visitor.getPurpose())
            .hostId(visitor.getHostId())
            .hostName(visitor.getHostName())
            .hostApartment(visitor.getHostApartment())
            .entryTime(visitor.getEntryTime())
            .exitTime(visitor.getExitTime())
            .status(visitor.getStatus().name())
            .vehicleNumber(visitor.getVehicleNumber())
            .photoUrl(visitor.getPhotoUrl())
            .qrCode(visitor.getQrCode())
            .societyId(visitor.getSocietyId())
            .approvedBy(visitor.getApprovedBy())
            .approvedAt(visitor.getApprovedAt())
            .checkedInBy(visitor.getCheckedInBy())
            .checkedOutBy(visitor.getCheckedOutBy())
            .rejectionReason(visitor.getRejectionReason())
            .createdAt(visitor.getCreatedAt())
            .updatedAt(visitor.getUpdatedAt())
            .build();
    }
}
