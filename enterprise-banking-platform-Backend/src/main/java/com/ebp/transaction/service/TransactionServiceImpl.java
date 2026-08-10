package com.ebp.transaction.service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ebp.account.entity.Account;
import com.ebp.account.entity.AccountStatus;
import com.ebp.account.repository.AccountRepository;
import com.ebp.transaction.dto.CreateDepositRequest;
import com.ebp.transaction.dto.CreateWithdrawalRequest;
import com.ebp.transaction.dto.TransactionResponse;
import com.ebp.transaction.dto.TransactionSummaryResponse;
import com.ebp.transaction.entity.Transaction;
import com.ebp.transaction.entity.TransactionStatus;
import com.ebp.transaction.entity.TransactionType;
import com.ebp.transaction.exception.InsufficientBalanceException;
import com.ebp.transaction.exception.TransactionNotFoundException;
import com.ebp.transaction.mapper.TransactionMapper;
import com.ebp.transaction.repository.TransactionRepository;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final TransactionMapper transactionMapper;

    public TransactionServiceImpl(
            TransactionRepository transactionRepository,
            AccountRepository accountRepository,
            TransactionMapper transactionMapper) {

        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.transactionMapper = transactionMapper;
    }

    private String generateTransactionReference() {

        return "TXN"
                + System.currentTimeMillis()
                + UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 6)
                        .toUpperCase();
    }

    @Override
    @Transactional
    public TransactionResponse deposit(CreateDepositRequest request) {

        Account account = getActiveAccount(request.getAccountId());

        BigDecimal balanceBefore = account.getBalance();
        BigDecimal balanceAfter =
                balanceBefore.add(request.getAmount());

        account.setBalance(balanceAfter);

        accountRepository.save(account);

        Transaction transaction = new Transaction();

        transaction.setAccount(account);
        transaction.setTransactionReference(
                generateTransactionReference());
        transaction.setTransactionType(TransactionType.DEPOSIT);
        transaction.setAmount(request.getAmount());
        transaction.setCurrency(account.getCurrency());
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setDescription(request.getDescription());
        transaction.setCreatedAt(OffsetDateTime.now());

        Transaction savedTransaction =
                transactionRepository.save(transaction);

        return transactionMapper.toResponse(savedTransaction);
    }

    @Override
    @Transactional
    public TransactionResponse withdraw(
            CreateWithdrawalRequest request) {

        Account account = getActiveAccount(request.getAccountId());

        BigDecimal balanceBefore = account.getBalance();

        if (balanceBefore.compareTo(request.getAmount()) < 0) {

            throw new InsufficientBalanceException(
                    "Insufficient balance. Available balance: "
                            + balanceBefore);
        }

        BigDecimal balanceAfter =
                balanceBefore.subtract(request.getAmount());

        account.setBalance(balanceAfter);

        accountRepository.save(account);

        Transaction transaction = new Transaction();

        transaction.setAccount(account);
        transaction.setTransactionReference(
                generateTransactionReference());
        transaction.setTransactionType(TransactionType.WITHDRAWAL);
        transaction.setAmount(request.getAmount());
        transaction.setCurrency(account.getCurrency());
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setDescription(request.getDescription());
        transaction.setCreatedAt(OffsetDateTime.now());

        Transaction savedTransaction =
                transactionRepository.save(transaction);

        return transactionMapper.toResponse(savedTransaction);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransactionById(UUID id) {

        Transaction transaction =
                transactionRepository.findById(id)
                        .orElseThrow(() ->
                                new TransactionNotFoundException(
                                        "Transaction with ID '"
                                                + id
                                                + "' not found."));

        return transactionMapper.toResponse(transaction);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionSummaryResponse>
            getTransactionsByAccount(
                    UUID accountId,
                    int page,
                    int size) {

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by("createdAt").descending());

        Page<Transaction> transactions =
                transactionRepository.findByAccountId(
                        accountId,
                        pageable);

        return transactions.map(
                transactionMapper::toSummary);
    }

    private Account getActiveAccount(UUID accountId) {

        Account account =
                accountRepository.findById(accountId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Account with ID '"
                                                + accountId
                                                + "' not found."));

        if (account.getStatus() != AccountStatus.ACTIVE) {

            throw new IllegalArgumentException(
                    "Account is not active.");
        }

        return account;
    }
}