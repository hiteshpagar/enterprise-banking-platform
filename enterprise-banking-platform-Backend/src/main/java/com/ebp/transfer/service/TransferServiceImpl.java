package com.ebp.transfer.service;

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
import com.ebp.transfer.dto.CreateTransferRequest;
import com.ebp.transfer.dto.TransferResponse;
import com.ebp.transfer.dto.TransferSummaryResponse;
import com.ebp.transfer.entity.Transfer;
import com.ebp.transfer.entity.TransferStatus;
import com.ebp.transfer.exception.InsufficientBalanceException;
import com.ebp.transfer.exception.TransferNotFoundException;
import com.ebp.transfer.mapper.TransferMapper;
import com.ebp.transfer.repository.TransferRepository;

@Service
public class TransferServiceImpl implements TransferService {

    private final TransferRepository transferRepository;
    private final AccountRepository accountRepository;
    private final TransferMapper transferMapper;

    public TransferServiceImpl(
            TransferRepository transferRepository,
            AccountRepository accountRepository,
            TransferMapper transferMapper) {

        this.transferRepository = transferRepository;
        this.accountRepository = accountRepository;
        this.transferMapper = transferMapper;
    }

    private String generateTransferReference() {

        return "TRF"
                + System.currentTimeMillis()
                + UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 6)
                        .toUpperCase();
    }

    @Override
    @Transactional
    public TransferResponse createTransfer(
            CreateTransferRequest request) {

        Account sourceAccount =
                getActiveAccount(request.getSourceAccountId());

        Account destinationAccount = null;

        if (request.getDestinationAccountNumber() != null
                && !request.getDestinationAccountNumber().isBlank()) {

            destinationAccount = accountRepository
                    .findByAccountNumber(request.getDestinationAccountNumber().trim())
                    .orElse(null);
        }

        if (destinationAccount == null && request.getDestinationAccountId() != null) {
            destinationAccount = accountRepository
                    .findById(request.getDestinationAccountId())
                    .orElse(null);
        }

        if (destinationAccount == null) {
            throw new IllegalArgumentException(
                    "Destination account not found.");
        }

        if (destinationAccount.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalArgumentException(
                    "Destination account is not active.");
        }

        if (sourceAccount.getId().equals(destinationAccount.getId())) {
            throw new IllegalArgumentException(
                    "Source and destination accounts must be different.");
        }

        if (!sourceAccount.getCurrency()
                .equals(destinationAccount.getCurrency())) {

            throw new IllegalArgumentException(
                    "Source and destination accounts must use the same currency.");
        }

        BigDecimal sourceBalance =
                sourceAccount.getBalance();

        if (sourceBalance.compareTo(request.getAmount()) < 0) {

            throw new InsufficientBalanceException(
                    "Insufficient balance. Available balance: "
                            + sourceBalance);
        }

        BigDecimal sourceBalanceAfter =
                sourceBalance.subtract(request.getAmount());

        BigDecimal destinationBalanceAfter =
                destinationAccount.getBalance()
                        .add(request.getAmount());

        sourceAccount.setBalance(sourceBalanceAfter);

        destinationAccount.setBalance(destinationBalanceAfter);

        accountRepository.save(sourceAccount);
        accountRepository.save(destinationAccount);

        Transfer transfer = new Transfer();

        transfer.setSourceAccount(sourceAccount);
        transfer.setDestinationAccount(destinationAccount);
        transfer.setTransferReference(
                generateTransferReference());
        transfer.setAmount(request.getAmount());
        transfer.setCurrency(sourceAccount.getCurrency());
        transfer.setStatus(TransferStatus.COMPLETED);
        transfer.setDescription(request.getDescription());
        transfer.setCreatedAt(OffsetDateTime.now());

        Transfer savedTransfer =
                transferRepository.save(transfer);

        return transferMapper.toResponse(savedTransfer);
    }

    @Override
    @Transactional(readOnly = true)
    public TransferResponse getTransferById(UUID id) {

        Transfer transfer =
                transferRepository.findById(id)
                        .orElseThrow(() ->
                                new TransferNotFoundException(
                                        "Transfer with ID '"
                                                + id
                                                + "' not found."));

        return transferMapper.toResponse(transfer);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransferSummaryResponse>
            getTransfersByAccount(
                    UUID accountId,
                    int page,
                    int size) {

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by("createdAt").descending());

        Page<Transfer> transfers =
                transferRepository
                        .findBySourceAccountIdOrDestinationAccountId(
                                accountId,
                                accountId,
                                pageable);

        return transfers.map(
                transferMapper::toSummary);
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