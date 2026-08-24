package com.ebp.report.dto;

import java.math.BigDecimal;

public class ReportSummaryDTO {

    private long totalCustomers;
    private long totalAccounts;
    private long totalTransactions;
    private BigDecimal totalCredits;
    private BigDecimal totalDebits;
    private BigDecimal netAmount;
    private long savingsAccountsCount;
    private long currentAccountsCount;
    private BigDecimal savingsTotalBalance;
    private BigDecimal currentTotalBalance;

    public ReportSummaryDTO() {
        this.totalCredits = BigDecimal.ZERO;
        this.totalDebits = BigDecimal.ZERO;
        this.netAmount = BigDecimal.ZERO;
        this.savingsTotalBalance = BigDecimal.ZERO;
        this.currentTotalBalance = BigDecimal.ZERO;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalAccounts() {
        return totalAccounts;
    }

    public void setTotalAccounts(long totalAccounts) {
        this.totalAccounts = totalAccounts;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public BigDecimal getTotalCredits() {
        return totalCredits;
    }

    public void setTotalCredits(BigDecimal totalCredits) {
        this.totalCredits = totalCredits;
    }

    public BigDecimal getTotalDebits() {
        return totalDebits;
    }

    public void setTotalDebits(BigDecimal totalDebits) {
        this.totalDebits = totalDebits;
    }

    public BigDecimal getNetAmount() {
        return netAmount;
    }

    public void setNetAmount(BigDecimal netAmount) {
        this.netAmount = netAmount;
    }

    public long getSavingsAccountsCount() {
        return savingsAccountsCount;
    }

    public void setSavingsAccountsCount(long savingsAccountsCount) {
        this.savingsAccountsCount = savingsAccountsCount;
    }

    public long getCurrentAccountsCount() {
        return currentAccountsCount;
    }

    public void setCurrentAccountsCount(long currentAccountsCount) {
        this.currentAccountsCount = currentAccountsCount;
    }

    public BigDecimal getSavingsTotalBalance() {
        return savingsTotalBalance;
    }

    public void setSavingsTotalBalance(BigDecimal savingsTotalBalance) {
        this.savingsTotalBalance = savingsTotalBalance;
    }

    public BigDecimal getCurrentTotalBalance() {
        return currentTotalBalance;
    }

    public void setCurrentTotalBalance(BigDecimal currentTotalBalance) {
        this.currentTotalBalance = currentTotalBalance;
    }
}
