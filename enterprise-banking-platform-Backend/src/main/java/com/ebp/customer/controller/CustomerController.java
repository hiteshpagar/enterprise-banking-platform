package com.ebp.customer.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.ebp.customer.dto.CreateCustomerRequest;
import com.ebp.customer.dto.CustomerResponse;
import com.ebp.customer.dto.CustomerSummaryResponse;
import com.ebp.customer.dto.UpdateCustomerRequest;
import com.ebp.customer.service.CustomerService;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/customers")
@Validated
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @Operation(summary = "Create Customer")
    @PostMapping
    @PreAuthorize("hasAuthority('CUSTOMER_CREATE')")
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerResponse createCustomer(
            @Valid @RequestBody CreateCustomerRequest request) {

        return customerService.createCustomer(request);
    }

    @Operation(summary = "Get Customer By ID")
    @GetMapping("/{id}")
     @PreAuthorize("hasAuthority('CUSTOMER_VIEW')")
    public CustomerResponse getCustomerById(
            @PathVariable UUID id) {

        return customerService.getCustomerById(id);
    }

    @Operation(summary = "Get All Customers")
    @GetMapping
    @PreAuthorize("hasAuthority('CUSTOMER_VIEW')")
    public Page<CustomerSummaryResponse> getAllCustomers(

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "10") int size,

            @RequestParam(defaultValue = "firstName") String sortBy,

            @RequestParam(required = false) String search) {

        return customerService.getAllCustomers(
                page,
                size,
                sortBy,
                search);
    }

    @Operation(summary = "Update Customer")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CUSTOMER_UPDATE')")
    public CustomerResponse updateCustomer(

            @PathVariable UUID id,

            @Valid @RequestBody UpdateCustomerRequest request) {

        return customerService.updateCustomer(id, request);
    }

    @Operation(summary = "Delete Customer")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CUSTOMER_DELETE')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCustomer(
            @PathVariable UUID id) {

        customerService.deleteCustomer(id);
    }
}