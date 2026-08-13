package com.ebp.transfer.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.ebp.transfer.dto.CreateTransferRequest;
import com.ebp.transfer.dto.TransferResponse;
import com.ebp.transfer.dto.TransferSummaryResponse;
import com.ebp.transfer.service.TransferService;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/transfers")
@Validated
public class TransferController {

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @Operation(summary = "Create Fund Transfer")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransferResponse createTransfer(
            @Valid @RequestBody CreateTransferRequest request) {

        return transferService.createTransfer(request);
    }

    @Operation(summary = "Get Transfer By ID")
    @GetMapping("/{id}")
    public TransferResponse getTransferById(
            @PathVariable UUID id) {

        return transferService.getTransferById(id);
    }

    @Operation(summary = "Get Account Transfer History")
    @GetMapping("/account/{accountId}")
    public Page<TransferSummaryResponse> getTransfersByAccount(
            @PathVariable UUID accountId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return transferService.getTransfersByAccount(
                accountId,
                page,
                size);
    }
}