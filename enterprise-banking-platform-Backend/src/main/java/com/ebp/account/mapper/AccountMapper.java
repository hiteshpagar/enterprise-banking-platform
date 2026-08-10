package com.ebp.account.mapper;

import org.springframework.stereotype.Component;

import com.ebp.account.dto.AccountResponse;
import com.ebp.account.dto.AccountSummaryResponse;
import com.ebp.account.dto.CreateAccountRequest;
import com.ebp.account.dto.UpdateAccountRequest;
import com.ebp.account.entity.Account;

@Component
public class AccountMapper {

	public Account toEntity(CreateAccountRequest request) {

	    Account account = new Account();

	    account.setAccountType(request.getAccountType());
	    account.setCurrency(request.getCurrency());
	    account.setBalance(request.getOpeningBalance());

	    return account;
	}

    public AccountResponse toResponse(Account account) {

        AccountResponse response = new AccountResponse();

        response.setId(account.getId());

        response.setCustomerId(account.getCustomer().getId());

        response.setCustomerName(
                account.getCustomer().getFirstName() + " "
                        + account.getCustomer().getLastName());

        response.setAccountNumber(account.getAccountNumber());
        response.setAccountType(account.getAccountType());
        response.setCurrency(account.getCurrency());
        response.setBalance(account.getBalance());
        response.setStatus(account.getStatus());
        response.setOpenedAt(account.getOpenedAt());
        response.setCreatedAt(account.getCreatedAt());
        response.setUpdatedAt(account.getUpdatedAt());

        return response;
    }

    public AccountSummaryResponse toSummary(Account account) {

        AccountSummaryResponse response = new AccountSummaryResponse();

        response.setId(account.getId());

        response.setCustomerName(
                account.getCustomer().getFirstName() + " "
                        + account.getCustomer().getLastName());

        response.setAccountNumber(account.getAccountNumber());
        response.setAccountType(account.getAccountType());
        response.setCurrency(account.getCurrency());
        response.setBalance(account.getBalance());
        response.setStatus(account.getStatus());

        return response;
    }

    public void updateEntity(Account account, UpdateAccountRequest request) {

        account.setCurrency(request.getCurrency());

        account.setStatus(request.getStatus());

        // Account Type, Customer, Account Number,
        // Balance and Opened At are intentionally not updated.
    }
}