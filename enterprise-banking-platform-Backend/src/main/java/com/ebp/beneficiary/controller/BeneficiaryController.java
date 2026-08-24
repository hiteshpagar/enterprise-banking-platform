package com.ebp.beneficiary.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.ebp.beneficiary.dto.BeneficiaryResponse;
import com.ebp.beneficiary.entity.BeneficiaryStatus;
import com.ebp.beneficiary.dto.CreateBeneficiaryRequest;
import com.ebp.beneficiary.dto.CreateCustomerBeneficiaryRequest;
import com.ebp.beneficiary.dto.UpdateBeneficiaryRequest;
import com.ebp.beneficiary.service.BeneficiaryService;
import com.ebp.security.userdetails.CustomUserDetails;

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

    // Customer-owned endpoints
    @Operation(summary = "Get Current Customer Beneficiaries")
    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public Page<BeneficiaryResponse> getCurrentCustomerBeneficiaries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) BeneficiaryStatus status,
            @AuthenticationPrincipal CustomUserDetails principal) {

        return beneficiaryService.getCurrentCustomerBeneficiaries(
                page,
                size,
                status,
                principal.getUsername());
    }

    @Operation(summary = "Create Beneficiary for Current Customer")
    @PostMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    @ResponseStatus(HttpStatus.CREATED)
    public BeneficiaryResponse createCustomerBeneficiary(
            @Valid @RequestBody CreateCustomerBeneficiaryRequest request,
            @AuthenticationPrincipal CustomUserDetails principal) {

        return beneficiaryService.createCustomerBeneficiary(
                request,
                principal.getUsername());
    }

    @Operation(summary = "Get Current Customer Beneficiary By ID")
    @GetMapping("/me/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public BeneficiaryResponse getCurrentCustomerBeneficiaryById(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails principal) {

        return beneficiaryService.getCustomerBeneficiaryById(
                id,
                principal.getUsername());
    }

    @Operation(summary = "Update Current Customer Beneficiary")
    @PutMapping("/me/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public BeneficiaryResponse updateCustomerBeneficiary(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateBeneficiaryRequest request,
            @AuthenticationPrincipal CustomUserDetails principal) {

        return beneficiaryService.updateCustomerBeneficiary(
                id,
                request,
                principal.getUsername());
    }

    @Operation(summary = "Delete Current Customer Beneficiary")
    @DeleteMapping("/me/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCustomerBeneficiary(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails principal) {

        beneficiaryService.deleteCustomerBeneficiary(
                id,
                principal.getUsername());
    }

    // Bank/Staff endpoints
    @Operation(summary = "Create Beneficiary")
    @PostMapping
    @PreAuthorize("hasAuthority('BENEFICIARY_CREATE')")
    @ResponseStatus(HttpStatus.CREATED)
    public BeneficiaryResponse createBeneficiary(
            @Valid @RequestBody CreateBeneficiaryRequest request) {

        return beneficiaryService.createBeneficiary(request);
    }

    @Operation(summary = "Get Beneficiary By ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('BENEFICIARY_VIEW')")
    public BeneficiaryResponse getBeneficiaryById(
            @PathVariable UUID id) {

        return beneficiaryService.getBeneficiaryById(id);
    }

    @Operation(summary = "Get Customer Beneficiaries")
    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAuthority('BENEFICIARY_VIEW')")
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
    @PreAuthorize("hasAuthority('BENEFICIARY_UPDATE')")
    public BeneficiaryResponse updateBeneficiary(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateBeneficiaryRequest request) {

        return beneficiaryService.updateBeneficiary(
                id,
                request);
    }

    @Operation(summary = "Delete Beneficiary")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('BENEFICIARY_DELETE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBeneficiary(
            @PathVariable UUID id) {

        beneficiaryService.deleteBeneficiary(id);
    }
}