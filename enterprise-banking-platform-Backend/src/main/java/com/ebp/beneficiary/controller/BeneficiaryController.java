package com.ebp.beneficiary.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.ebp.beneficiary.dto.BeneficiaryResponse;
import com.ebp.beneficiary.dto.CreateBeneficiaryRequest;
import com.ebp.beneficiary.dto.UpdateBeneficiaryRequest;
import com.ebp.beneficiary.service.BeneficiaryService;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/beneficiaries")
@Validated
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    public BeneficiaryController(
            BeneficiaryService beneficiaryService) {
        this.beneficiaryService = beneficiaryService;
    }

    @Operation(summary = "Create Beneficiary")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BeneficiaryResponse createBeneficiary(
            @Valid @RequestBody CreateBeneficiaryRequest request) {

        return beneficiaryService.createBeneficiary(request);
    }

    @Operation(summary = "Get Beneficiary By ID")
    @GetMapping("/{id}")
    public BeneficiaryResponse getBeneficiaryById(
            @PathVariable UUID id) {

        return beneficiaryService.getBeneficiaryById(id);
    }

    @Operation(summary = "Get Customer Beneficiaries")
    @GetMapping("/customer/{customerId}")
    public Page<BeneficiaryResponse> getBeneficiariesByCustomer(
            @PathVariable UUID customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return beneficiaryService.getBeneficiariesByCustomer(
                customerId,
                page,
                size);
    }

    @Operation(summary = "Update Beneficiary")
    @PutMapping("/{id}")
    public BeneficiaryResponse updateBeneficiary(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateBeneficiaryRequest request) {

        return beneficiaryService.updateBeneficiary(
                id,
                request);
    }

    @Operation(summary = "Delete Beneficiary")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBeneficiary(
            @PathVariable UUID id) {

        beneficiaryService.deleteBeneficiary(id);
    }
}