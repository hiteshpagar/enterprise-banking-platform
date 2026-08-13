package com.ebp.transfer.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ebp.transfer.entity.Transfer;

public interface TransferRepository
        extends JpaRepository<Transfer, UUID> {

    Optional<Transfer> findByTransferReference(
            String transferReference);

    boolean existsByTransferReference(
            String transferReference);

    Page<Transfer> findBySourceAccountIdOrDestinationAccountId(
            UUID sourceAccountId,
            UUID destinationAccountId,
            Pageable pageable);
}