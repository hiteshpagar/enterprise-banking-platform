package com.ebp.transaction.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.ebp.transaction.dto.CreateDepositRequest;
import com.ebp.transaction.dto.CreateWithdrawalRequest;
import com.ebp.transaction.dto.TransactionResponse;
import com.ebp.transaction.dto.TransactionSummaryResponse;
import com.ebp.transaction.service.TransactionService;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/transactions")
@Validated
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @Operation(summary = "Create Deposit")
    @PostMapping("/deposit")
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse deposit(
            @Valid @RequestBody CreateDepositRequest request) {

        return transactionService.deposit(request);
    }

    @Operation(summary = "Create Withdrawal")
    @PostMapping("/withdraw")
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse withdraw(
            @Valid @RequestBody CreateWithdrawalRequest request) {

        return transactionService.withdraw(request);
    }

    @Operation(summary = "Get Transaction By ID")
    @GetMapping("/{id}")
    public TransactionResponse getTransactionById(
            @PathVariable UUID id) {

        return transactionService.getTransactionById(id);
    }

    @Operation(summary = "Get Account Transaction History")
    @GetMapping("/account/{accountId}")
    public Page<TransactionSummaryResponse> getTransactionsByAccount(
            @PathVariable UUID accountId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return transactionService.getTransactionsByAccount(
                accountId,
                page,
                size);
    }
}