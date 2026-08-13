package com.ebp.beneficiary.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ebp.beneficiary.entity.Beneficiary;

public interface BeneficiaryRepository
        extends JpaRepository<Beneficiary, UUID> {

    Page<Beneficiary> findByCustomerId(
            UUID customerId,
            Pageable pageable);

    Optional<Beneficiary> findByCustomerIdAndAccountId(
            UUID customerId,
            UUID accountId);

    boolean existsByCustomerIdAndAccountId(
            UUID customerId,
            UUID accountId);
}