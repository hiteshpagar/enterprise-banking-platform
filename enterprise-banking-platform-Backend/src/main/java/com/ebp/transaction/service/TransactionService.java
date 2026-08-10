package com.ebp.transaction.service;

import java.util.UUID;

import org.springframework.data.domain.Page;

import com.ebp.transaction.dto.CreateDepositRequest;
import com.ebp.transaction.dto.CreateWithdrawalRequest;
import com.ebp.transaction.dto.TransactionResponse;
import com.ebp.transaction.dto.TransactionSummaryResponse;

public interface TransactionService {

    TransactionResponse deposit(
            CreateDepositRequest request);

    TransactionResponse withdraw(
            CreateWithdrawalRequest request);

    TransactionResponse getTransactionById(
            UUID id);

    Page<TransactionSummaryResponse> getTransactionsByAccount(
            UUID accountId,
            int page,
            int size);
}