package com.ebp.customer.service;

import java.util.UUID;

import org.springframework.data.domain.Page;

import com.ebp.customer.dto.CreateCustomerRequest;
import com.ebp.customer.dto.CustomerResponse;
import com.ebp.customer.dto.CustomerSummaryResponse;
import com.ebp.customer.dto.UpdateCustomerRequest;

public interface CustomerService {

    CustomerResponse createCustomer(CreateCustomerRequest request);

    CustomerResponse getCustomerById(UUID id);

    Page<CustomerSummaryResponse> getAllCustomers(
            int page,
            int size,
            String sortBy,
            String search);

    CustomerResponse updateCustomer(
            UUID id,
            UpdateCustomerRequest request);

    void deleteCustomer(UUID id);
}