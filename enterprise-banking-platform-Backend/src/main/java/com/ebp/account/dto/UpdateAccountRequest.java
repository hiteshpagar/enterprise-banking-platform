package com.ebp.account.dto;

import com.ebp.account.entity.AccountStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateAccountRequest {

    @NotNull(message = "Status is required")
    private AccountStatus status;

    @NotBlank(message = "Currency is required")
    @Size(max = 10)
    private String currency;

    public AccountStatus getStatus() {
        return status;
    }

    public void setStatus(AccountStatus status) {
        this.status = status;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}