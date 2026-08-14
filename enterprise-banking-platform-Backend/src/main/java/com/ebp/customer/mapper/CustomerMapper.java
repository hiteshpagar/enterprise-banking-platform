package com.ebp.customer.mapper;

import org.springframework.stereotype.Component;

import com.ebp.customer.dto.CreateCustomerRequest;
import com.ebp.customer.dto.CustomerResponse;
import com.ebp.customer.dto.CustomerSummaryResponse;
import com.ebp.customer.dto.UpdateCustomerRequest;
import com.ebp.customer.entity.Customer;

@Component
public class CustomerMapper {

    public Customer toEntity(CreateCustomerRequest request) {

        Customer customer = new Customer();

        customer.setFirstName(request.getFirstName());
        customer.setMiddleName(request.getMiddleName());
        customer.setLastName(request.getLastName());
        customer.setDateOfBirth(request.getDateOfBirth());
        customer.setGender(request.getGender());
        customer.setMobileNumber(request.getMobileNumber());
        customer.setEmail(request.getEmail());
        customer.setStatus(request.getStatus());

        return customer;
    }

    public CustomerResponse toResponse(Customer customer) {

        CustomerResponse response = new CustomerResponse();

        response.setId(customer.getId());
        response.setCustomerNumber(customer.getCustomerNumber());
        response.setFirstName(customer.getFirstName());
        response.setMiddleName(customer.getMiddleName());
        response.setLastName(customer.getLastName());
        response.setDateOfBirth(customer.getDateOfBirth());
        response.setGender(customer.getGender());
        response.setMobileNumber(customer.getMobileNumber());
        response.setEmail(customer.getEmail());
        response.setStatus(customer.getStatus());
        response.setCreatedAt(customer.getCreatedAt());
        response.setUpdatedAt(customer.getUpdatedAt());

        return response;
    }

    public CustomerSummaryResponse toSummary(Customer customer) {

        CustomerSummaryResponse response = new CustomerSummaryResponse();

        response.setId(customer.getId());
        response.setCustomerNumber(customer.getCustomerNumber());
        response.setFirstName(customer.getFirstName());
        response.setLastName(customer.getLastName());
        response.setMobileNumber(customer.getMobileNumber());
        response.setEmail(customer.getEmail());
        response.setStatus(customer.getStatus());

        return response;
    }

    public void updateEntity(Customer customer, UpdateCustomerRequest request) {

        customer.setFirstName(request.getFirstName());
        customer.setMiddleName(request.getMiddleName());
        customer.setLastName(request.getLastName());
        customer.setDateOfBirth(request.getDateOfBirth());
        customer.setGender(request.getGender());
        customer.setMobileNumber(request.getMobileNumber());
        customer.setEmail(request.getEmail());
        customer.setStatus(request.getStatus());
    }
}
