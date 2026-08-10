package com.ebp.transaction.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ebp.transaction.entity.Transaction;

public interface TransactionRepository
        extends JpaRepository<Transaction, UUID> {

    Optional<Transaction> findByTransactionReference(
            String transactionReference);

    boolean existsByTransactionReference(
            String transactionReference);

    Page<Transaction> findByAccountId(
            UUID accountId,
            Pageable pageable);
}