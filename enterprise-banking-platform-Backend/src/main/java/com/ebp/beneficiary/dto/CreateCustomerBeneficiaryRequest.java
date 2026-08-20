package com.ebp.beneficiary.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateCustomerBeneficiaryRequest {

    private UUID accountId;

    @NotBlank(message = "Beneficiary name is required")
    @Size(max = 150, message = "Beneficiary name must not exceed 150 characters")
    private String beneficiaryName;

    @Size(max = 150, message = "Bank name must not exceed 150 characters")
    private String bankName;

    @NotBlank(message = "Account number is required")
    @Size(max = 30, message = "Account number must not exceed 30 characters")
    private String accountNumber;

    public UUID getAccountId() {
        return accountId;
    }

    public void setAccountId(UUID accountId) {
        this.accountId = accountId;
    }

    public String getBeneficiaryName() {
        return beneficiaryName;
    }

    public void setBeneficiaryName(String beneficiaryName) {
        this.beneficiaryName = beneficiaryName;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }
}
