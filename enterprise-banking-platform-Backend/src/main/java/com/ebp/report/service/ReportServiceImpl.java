package com.ebp.report.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ebp.account.entity.Account;
import com.ebp.account.entity.AccountType;
import com.ebp.account.repository.AccountRepository;
import com.ebp.customer.repository.CustomerRepository;
import com.ebp.report.dto.ReportSummaryDTO;
import com.ebp.transaction.entity.Transaction;
import com.ebp.transaction.entity.TransactionType;
import com.ebp.transaction.repository.TransactionRepository;

@Service
public class ReportServiceImpl implements ReportService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public ReportServiceImpl(
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            TransactionRepository transactionRepository) {
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ReportSummaryDTO getReportSummary() {
        ReportSummaryDTO dto = new ReportSummaryDTO();

        long totalCustomers = customerRepository.count();
        long totalAccounts = accountRepository.count();
        long totalTransactions = transactionRepository.count();

        dto.setTotalCustomers(totalCustomers);
        dto.setTotalAccounts(totalAccounts);
        dto.setTotalTransactions(totalTransactions);

        List<Transaction> transactions = transactionRepository.findAll();
        BigDecimal totalCredits = BigDecimal.ZERO;
        BigDecimal totalDebits = BigDecimal.ZERO;

        for (Transaction tx : transactions) {
            if (tx.getAmount() != null) {
                if (tx.getTransactionType() == TransactionType.DEPOSIT) {
                    totalCredits = totalCredits.add(tx.getAmount());
                } else if (tx.getTransactionType() == TransactionType.WITHDRAWAL) {
                    totalDebits = totalDebits.add(tx.getAmount());
                }
            }
        }

        dto.setTotalCredits(totalCredits);
        dto.setTotalDebits(totalDebits);
        dto.setNetAmount(totalCredits.subtract(totalDebits));

        List<Account> accounts = accountRepository.findAll();
        long savingsCount = 0;
        long currentCount = 0;
        BigDecimal savingsBalance = BigDecimal.ZERO;
        BigDecimal currentBalance = BigDecimal.ZERO;

        for (Account acc : accounts) {
            if (acc.getAccountType() == AccountType.SAVINGS) {
                savingsCount++;
                if (acc.getBalance() != null) {
                    savingsBalance = savingsBalance.add(acc.getBalance());
                }
            } else if (acc.getAccountType() == AccountType.CURRENT) {
                currentCount++;
                if (acc.getBalance() != null) {
                    currentBalance = currentBalance.add(acc.getBalance());
                }
            }
        }

        dto.setSavingsAccountsCount(savingsCount);
        dto.setCurrentAccountsCount(currentCount);
        dto.setSavingsTotalBalance(savingsBalance);
        dto.setCurrentTotalBalance(currentBalance);

        return dto;
    }
}
