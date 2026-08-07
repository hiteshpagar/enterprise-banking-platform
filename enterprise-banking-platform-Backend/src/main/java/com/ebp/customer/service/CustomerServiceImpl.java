package com.ebp.customer.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ebp.customer.dto.CreateCustomerRequest;
import com.ebp.customer.dto.CustomerResponse;
import com.ebp.customer.dto.CustomerSummaryResponse;
import com.ebp.customer.dto.UpdateCustomerRequest;
import com.ebp.customer.mapper.CustomerMapper;
import com.ebp.customer.repository.CustomerRepository;
import com.ebp.customer.entity.Customer;
import com.ebp.customer.exception.CustomerAlreadyExistsException;
import com.ebp.customer.exception.CustomerNotFoundException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Service
public class CustomerServiceImpl implements CustomerService {

	private final CustomerRepository customerRepository;
	private final CustomerMapper customerMapper;

	private String generateCustomerNumber() {

		long count = customerRepository.count() + 1;

		return String.format("CUST%06d", count);
	}

	public CustomerServiceImpl(CustomerRepository customerRepository, CustomerMapper customerMapper) {

		this.customerRepository = customerRepository;
		this.customerMapper = customerMapper;
	}

	@Override
	public CustomerResponse createCustomer(CreateCustomerRequest request) {

		if (customerRepository.existsByEmail(request.getEmail())) {
			throw new CustomerAlreadyExistsException(
					"Customer with email '" + request.getEmail() + "' already exists.");
		}

		if (customerRepository.existsByMobileNumber(request.getMobileNumber())) {
			throw new CustomerAlreadyExistsException(
					"Customer with mobile number '" + request.getMobileNumber() + "' already exists.");
		}

		Customer customer = customerMapper.toEntity(request);

		customer.setCustomerNumber(generateCustomerNumber());

		Customer savedCustomer = customerRepository.save(customer);

		return customerMapper.toResponse(savedCustomer);
	}

	@Override
	public CustomerResponse getCustomerById(UUID id) {

		Customer customer = customerRepository.findById(id)
				.orElseThrow(() -> new CustomerNotFoundException("Customer with ID '" + id + "' not found."));

		return customerMapper.toResponse(customer);
	}

	@Override
	public Page<CustomerSummaryResponse> getAllCustomers(int page, int size, String sortBy, String search) {

		Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).ascending());

		Page<Customer> customers;

		if (search == null || search.isBlank()) {
			customers = customerRepository.findAll(pageable);
		} else {
			customers = customerRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(search,
					search, pageable);
		}

		return customers.map(customerMapper::toSummary);
	}

	@Override
	public CustomerResponse updateCustomer(UUID id, UpdateCustomerRequest request) {

		Customer customer = customerRepository.findById(id)
				.orElseThrow(() -> new CustomerNotFoundException("Customer with ID '" + id + "' not found."));

		if (!customer.getEmail().equals(request.getEmail()) && customerRepository.existsByEmail(request.getEmail())) {

			throw new CustomerAlreadyExistsException(
					"Customer with email '" + request.getEmail() + "' already exists.");
		}

		if (!customer.getMobileNumber().equals(request.getMobileNumber())
				&& customerRepository.existsByMobileNumber(request.getMobileNumber())) {

			throw new CustomerAlreadyExistsException(
					"Customer with mobile number '" + request.getMobileNumber() + "' already exists.");
		}

		customerMapper.updateEntity(customer, request);

		Customer updatedCustomer = customerRepository.save(customer);

		return customerMapper.toResponse(updatedCustomer);
	}

	@Override
	public void deleteCustomer(UUID id) {

		Customer customer = customerRepository.findById(id)
				.orElseThrow(() -> new CustomerNotFoundException("Customer with ID '" + id + "' not found."));

		customerRepository.delete(customer);
	}
}