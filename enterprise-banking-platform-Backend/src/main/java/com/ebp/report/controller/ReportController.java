package com.ebp.report.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ebp.report.dto.ReportSummaryDTO;
import com.ebp.report.service.ReportService;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @Operation(summary = "Get Banking Platform Summary Report Analytics")
    @GetMapping("/summary")
    @PreAuthorize("isAuthenticated()")
    public ReportSummaryDTO getReportSummary() {
        return reportService.getReportSummary();
    }
}
