package com.ebp.transaction.mapper;

import org.springframework.stereotype.Component;

import com.ebp.transaction.dto.TransactionResponse;
import com.ebp.transaction.dto.TransactionSummaryResponse;
import com.ebp.transaction.entity.Transaction;

@Component
public class TransactionMapper {

    public TransactionResponse toResponse(Transaction transaction) {

        TransactionResponse response = new TransactionResponse();

        response.setId(transaction.getId());
        response.setAccountId(transaction.getAccount().getId());
        response.setAccountNumber(
                transaction.getAccount().getAccountNumber());
        response.setTransactionReference(
                transaction.getTransactionReference());
        response.setTransactionType(
                transaction.getTransactionType());
        response.setAmount(transaction.getAmount());
        response.setCurrency(transaction.getCurrency());
        response.setBalanceBefore(transaction.getBalanceBefore());
        response.setBalanceAfter(transaction.getBalanceAfter());
        response.setStatus(transaction.getStatus());
        response.setDescription(transaction.getDescription());
        response.setCreatedAt(transaction.getCreatedAt());

        return response;
    }

    public TransactionSummaryResponse toSummary(
            Transaction transaction) {

        TransactionSummaryResponse response =
                new TransactionSummaryResponse();

        response.setId(transaction.getId());
        response.setTransactionReference(
                transaction.getTransactionReference());
        response.setAccountId(transaction.getAccount().getId());
        response.setAccountNumber(
                transaction.getAccount().getAccountNumber());
        response.setTransactionType(
                transaction.getTransactionType());
        response.setAmount(transaction.getAmount());
        response.setCurrency(transaction.getCurrency());
        response.setStatus(transaction.getStatus());
        response.setCreatedAt(transaction.getCreatedAt());

        return response;
    }
}