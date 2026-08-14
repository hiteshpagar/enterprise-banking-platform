package com.ebp.account.service;

import java.util.UUID;

import org.springframework.data.domain.Page;

import com.ebp.account.dto.AccountResponse;
import com.ebp.account.dto.AccountSummaryResponse;
import com.ebp.account.dto.CreateAccountRequest;
import com.ebp.account.dto.UpdateAccountRequest;

public interface AccountService {

    AccountResponse createAccount(CreateAccountRequest request);

    AccountResponse getAccountById(UUID id);

    AccountResponse getCustomerAccountById(
            UUID id,
            String username);

    Page<AccountSummaryResponse> getAllAccounts(
            int page,
            int size,
            String sortBy,
            String search);

    Page<AccountSummaryResponse> getCurrentCustomerAccounts(
            int page,
            int size,
            String sortBy,
            String search,
            String username);

    AccountResponse updateAccount(
            UUID id,
            UpdateAccountRequest request);

    void deleteAccount(UUID id);
}
