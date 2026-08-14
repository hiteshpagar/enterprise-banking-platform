package com.ebp.account.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
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

import com.ebp.account.dto.AccountResponse;
import com.ebp.account.dto.AccountSummaryResponse;
import com.ebp.account.dto.CreateAccountRequest;
import com.ebp.account.dto.UpdateAccountRequest;
import com.ebp.account.service.AccountService;
import com.ebp.security.userdetails.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/accounts")
@Validated
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @Operation(summary = "Create Account")
    @PostMapping
    @PreAuthorize("hasAuthority('ACCOUNT_CREATE')")
    @ResponseStatus(HttpStatus.CREATED)
    public AccountResponse createAccount(
            @Valid @RequestBody CreateAccountRequest request) {

        return accountService.createAccount(request);
    }

    @Operation(summary = "Get Account By ID")
    @GetMapping("/me/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public AccountResponse getCurrentCustomerAccountById(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails principal) {

        return accountService.getCustomerAccountById(
                id,
                principal.getUsername());
    }

    @Operation(summary = "Get Current Customer Accounts")
    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public Page<AccountSummaryResponse> getCurrentCustomerAccounts(

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "10") int size,

            @RequestParam(defaultValue = "accountNumber") String sortBy,

            @RequestParam(required = false) String search,

            @AuthenticationPrincipal CustomUserDetails principal) {

        return accountService.getCurrentCustomerAccounts(
                page,
                size,
                sortBy,
                search,
                principal.getUsername());
    }

    @Operation(summary = "Get Account By ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ACCOUNT_VIEW')")
    public AccountResponse getAccountById(
            @PathVariable UUID id) {

        return accountService.getAccountById(id);
    }

    @Operation(summary = "Get All Accounts")
    @GetMapping
    @PreAuthorize("hasAuthority('ACCOUNT_VIEW')")
    public Page<AccountSummaryResponse> getAllAccounts(

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "10") int size,

            @RequestParam(defaultValue = "accountNumber") String sortBy,

            @RequestParam(required = false) String search) {

        return accountService.getAllAccounts(
                page,
                size,
                sortBy,
                search);
    }

    @Operation(summary = "Update Account")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ACCOUNT_UPDATE')")
    public AccountResponse updateAccount(

            @PathVariable UUID id,

            @Valid @RequestBody UpdateAccountRequest request) {

        return accountService.updateAccount(id, request);
    }

    @Operation(summary = "Delete Account")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ACCOUNT_DELETE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAccount(
            @PathVariable UUID id) {

        accountService.deleteAccount(id);
    }
}
