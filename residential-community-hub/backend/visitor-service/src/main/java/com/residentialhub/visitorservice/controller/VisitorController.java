package com.residentialhub.visitorservice.controller;

import com.residentialhub.visitorservice.dto.*;
import com.residentialhub.visitorservice.service.VisitorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/visitors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VisitorController {

    private final VisitorService visitorService;

    @PostMapping
    public ResponseEntity<ApiResponse<VisitorDto>> createVisitor(
            @Valid @RequestBody CreateVisitorRequest request,
            @RequestHeader("X-User-Id") String userId) {
        VisitorDto visitor = visitorService.createVisitor(request, userId);
        return ResponseEntity.ok(ApiResponse.success(visitor, "Visitor created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VisitorDto>> getVisitor(@PathVariable String id) {
        VisitorDto visitor = visitorService.getVisitor(id);
        return ResponseEntity.ok(ApiResponse.success(visitor));
    }

    @GetMapping("/society/{societyId}")
    public ResponseEntity<ApiResponse<List<VisitorDto>>> getVisitorsBySociety(@PathVariable String societyId) {
        List<VisitorDto> visitors = visitorService.getVisitorsBySociety(societyId);
        return ResponseEntity.ok(ApiResponse.success(visitors));
    }

    @GetMapping("/society/{societyId}/paged")
    public ResponseEntity<ApiResponse<Page<VisitorDto>>> getVisitorsBySocietyPaged(
            @PathVariable String societyId,
            Pageable pageable) {
        Page<VisitorDto> visitors = visitorService.getVisitorsBySociety(societyId, pageable);
        return ResponseEntity.ok(ApiResponse.success(visitors));
    }

    @GetMapping("/host/{hostId}")
    public ResponseEntity<ApiResponse<List<VisitorDto>>> getVisitorsByHost(@PathVariable String hostId) {
        List<VisitorDto> visitors = visitorService.getVisitorsByHost(hostId);
        return ResponseEntity.ok(ApiResponse.success(visitors));
    }

    @GetMapping("/society/{societyId}/today")
    public ResponseEntity<ApiResponse<List<VisitorDto>>> getTodayVisitors(@PathVariable String societyId) {
        List<VisitorDto> visitors = visitorService.getTodayVisitors(societyId);
        return ResponseEntity.ok(ApiResponse.success(visitors));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<VisitorDto>> approveVisitor(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId) {
        VisitorDto visitor = visitorService.approveVisitor(id, userId);
        return ResponseEntity.ok(ApiResponse.success(visitor, "Visitor approved successfully"));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<VisitorDto>> rejectVisitor(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId,
            @RequestParam String reason) {
        VisitorDto visitor = visitorService.rejectVisitor(id, userId, reason);
        return ResponseEntity.ok(ApiResponse.success(visitor, "Visitor rejected"));
    }

    @PostMapping("/{id}/checkin")
    public ResponseEntity<ApiResponse<VisitorDto>> checkIn(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId) {
        VisitorDto visitor = visitorService.checkIn(id, userId);
        return ResponseEntity.ok(ApiResponse.success(visitor, "Visitor checked in successfully"));
    }

    @PostMapping("/{id}/checkout")
    public ResponseEntity<ApiResponse<VisitorDto>> checkOut(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId) {
        VisitorDto visitor = visitorService.checkOut(id, userId);
        return ResponseEntity.ok(ApiResponse.success(visitor, "Visitor checked out successfully"));
    }

    @GetMapping("/society/{societyId}/stats")
    public ResponseEntity<ApiResponse<VisitorStats>> getVisitorStats(@PathVariable String societyId) {
        VisitorStats stats = visitorService.getVisitorStats(societyId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
