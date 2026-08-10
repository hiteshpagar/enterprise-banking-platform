package com.ebp.account.service;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.ebp.account.dto.AccountResponse;
import com.ebp.account.dto.AccountSummaryResponse;
import com.ebp.account.dto.CreateAccountRequest;
import com.ebp.account.dto.UpdateAccountRequest;
import com.ebp.account.entity.Account;
import com.ebp.account.entity.AccountStatus;
import com.ebp.account.exception.AccountNotFoundException;
import com.ebp.account.mapper.AccountMapper;
import com.ebp.account.repository.AccountRepository;
import com.ebp.customer.entity.Customer;
import com.ebp.customer.exception.CustomerNotFoundException;
import com.ebp.customer.repository.CustomerRepository;
import org.springframework.transaction.annotation.Transactional;


@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final AccountMapper accountMapper;

    public AccountServiceImpl(
            AccountRepository accountRepository,
            CustomerRepository customerRepository,
            AccountMapper accountMapper) {

        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
        this.accountMapper = accountMapper;
    }

    private String generateAccountNumber() {
        return String.valueOf(accountRepository.getNextAccountNumber());
    }

    @Override
    public AccountResponse createAccount(CreateAccountRequest request) {

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() ->
                        new CustomerNotFoundException(
                                "Customer with ID '" + request.getCustomerId() + "' not found."));

        String accountNumber = generateAccountNumber();

        Account account = accountMapper.toEntity(request);

        account.setCustomer(customer);
        account.setAccountNumber(accountNumber);
        account.setOpenedAt(OffsetDateTime.now());
        account.setStatus(AccountStatus.ACTIVE);

        Account savedAccount = accountRepository.save(account);

        return accountMapper.toResponse(savedAccount);
    }

    @Override
    @Transactional(readOnly = true)
    public AccountResponse getAccountById(UUID id) {

        Account account = accountRepository.findById(id)
                .orElseThrow(() ->
                        new AccountNotFoundException(
                                "Account with ID '" + id + "' not found."));

        return accountMapper.toResponse(account);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AccountSummaryResponse> getAllAccounts(
            int page,
            int size,
            String sortBy,
            String search) {

        Pageable pageable =
                PageRequest.of(page, size, Sort.by(sortBy).ascending());

        Page<Account> accounts;

        if (search == null || search.isBlank()) {
            accounts = accountRepository.findAll(pageable);
        } else {
            accounts = accountRepository
                    .findByAccountNumberContainingIgnoreCase(search, pageable);
        }

        return accounts.map(accountMapper::toSummary);
    }

    @Override
    @Transactional
    public AccountResponse updateAccount(
            UUID id,
            UpdateAccountRequest request) {

        Account account = accountRepository.findById(id)
                .orElseThrow(() ->
                        new AccountNotFoundException(
                                "Account with ID '" + id + "' not found."));

        accountMapper.updateEntity(account, request);

        Account updatedAccount = accountRepository.save(account);

        return accountMapper.toResponse(updatedAccount);
    }

    @Override
    public void deleteAccount(UUID id) {

        Account account = accountRepository.findById(id)
                .orElseThrow(() ->
                        new AccountNotFoundException(
                                "Account with ID '" + id + "' not found."));

        accountRepository.delete(account);
    }
}