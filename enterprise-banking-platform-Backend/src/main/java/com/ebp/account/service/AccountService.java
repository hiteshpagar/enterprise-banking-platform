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

    Page<AccountSummaryResponse> getAllAccounts(
            int page,
            int size,
            String sortBy,
            String search);

    AccountResponse updateAccount(
            UUID id,
            UpdateAccountRequest request);

    void deleteAccount(UUID id);
}