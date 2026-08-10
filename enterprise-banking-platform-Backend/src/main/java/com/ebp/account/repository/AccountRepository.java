package com.ebp.account.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ebp.account.entity.Account;
import com.ebp.account.entity.AccountStatus;
import com.ebp.customer.entity.Customer;
import org.springframework.data.jpa.repository.Query;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    Optional<Account> findByAccountNumber(String accountNumber);

    boolean existsByAccountNumber(String accountNumber);

    Page<Account> findByCustomer(Customer customer, Pageable pageable);

    Page<Account> findByStatus(AccountStatus status, Pageable pageable);

    Page<Account> findByAccountNumberContainingIgnoreCase(
            String accountNumber,
            Pageable pageable);
    
    @Query(value = "SELECT nextval('account.account_number_seq')", nativeQuery = true)
    Long getNextAccountNumber();
}