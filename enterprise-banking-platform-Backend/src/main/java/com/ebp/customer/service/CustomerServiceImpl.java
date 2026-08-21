package com.ebp.customer.service;

import java.security.SecureRandom;
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
import com.ebp.customer.exception.CustomerOnboardingEmailException;
import com.ebp.role.entity.Role;
import com.ebp.role.repository.RoleRepository;
import com.ebp.user.entity.User;
import com.ebp.user.exception.UserAlreadyExistsException;
import com.ebp.userrole.entity.UserRole;
import com.ebp.userrole.entity.UserRoleId;
import com.ebp.userrole.repository.UserRoleRepository;
import com.ebp.user.repository.UserRepository;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerServiceImpl implements CustomerService {

	private final CustomerRepository customerRepository;
	private final CustomerMapper customerMapper;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final CustomerOnboardingEmailService onboardingEmailService;
    private final SecureRandom secureRandom = new SecureRandom();
    private static final String TEMP_PASSWORD_CHARS =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%";

	private String generateCustomerNumber() {

		long count = customerRepository.count() + 1;

		return String.format("CUST%06d", count);
	}

	public CustomerServiceImpl(
            CustomerRepository customerRepository,
            CustomerMapper customerMapper,
            UserRepository userRepository,
            RoleRepository roleRepository,
            UserRoleRepository userRoleRepository,
            PasswordEncoder passwordEncoder,
            CustomerOnboardingEmailService onboardingEmailService) {

		this.customerRepository = customerRepository;
		this.customerMapper = customerMapper;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
        this.onboardingEmailService = onboardingEmailService;
	}

	@Override
    @Transactional(noRollbackFor = CustomerOnboardingEmailException.class)
	public CustomerResponse createCustomer(CreateCustomerRequest request) {

		if (customerRepository.existsByEmail(request.getEmail())) {
			throw new CustomerAlreadyExistsException(
					"Customer with email '" + request.getEmail() + "' already exists.");
		}

		if (customerRepository.existsByMobileNumber(request.getMobileNumber())) {
			throw new CustomerAlreadyExistsException(
					"Customer with mobile number '" + request.getMobileNumber() + "' already exists.");
		}

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException(
                    "User with email '" + request.getEmail() + "' already exists.");
        }

		Customer customer = customerMapper.toEntity(request);

		customer.setCustomerNumber(generateCustomerNumber());

        String username = generateUniqueUsername(
                request.getFirstName(),
                request.getLastName(),
                customer.getCustomerNumber());

        String temporaryPassword = generateTemporaryPassword();

        User user = new User();
        user.setUsername(username);
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        user.setEnabled(true);
        user.setAccountNonLocked(true);
        user.setAccountNonExpired(true);
        user.setCredentialsNonExpired(true);
        user.setMustChangeCredentials(true);

        User savedUser = userRepository.save(user);

        Role customerRole = roleRepository.findByName("CUSTOMER")
                .orElseThrow(() ->
                        new IllegalStateException("CUSTOMER role is not configured."));

        UserRole userRole = new UserRole();
        userRole.setId(new UserRoleId(savedUser.getId(), customerRole.getId()));
        userRole.setUser(savedUser);
        userRole.setRole(customerRole);
        userRoleRepository.save(userRole);

        customer.setUser(savedUser);

		Customer savedCustomer = customerRepository.save(customer);

        onboardingEmailService.sendCredentials(
                savedCustomer,
                username,
                temporaryPassword);

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

    private String generateUniqueUsername(
            String firstName,
            String lastName,
            String customerNumber) {

        String normalizedFirstName = normalizeUsername(firstName);
        String normalizedLastName = normalizeUsername(lastName);
        String baseUsername;

        if (!normalizedFirstName.isBlank() && !normalizedLastName.isBlank()) {
            baseUsername = normalizedFirstName + "." + normalizedLastName;
        } else {
            baseUsername = normalizedFirstName + normalizedLastName;
        }

        if (baseUsername.isBlank()) {
            baseUsername = "customer";
        }

        String customerSuffix = customerNumber
                .replaceAll("[^0-9]", "");

        String username = baseUsername + customerSuffix;
        int attempt = 1;

        while (userRepository.existsByUsername(username)) {
            username = baseUsername + customerSuffix + attempt;
            attempt++;
        }

        return username;
    }

    private String normalizeUsername(String value) {

        if (value == null) {
            return "";
        }

        return value
                .trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9]", "");
    }

    private String generateTemporaryPassword() {

        StringBuilder password = new StringBuilder();

        for (int index = 0; index < 12; index++) {
            int characterIndex =
                    secureRandom.nextInt(TEMP_PASSWORD_CHARS.length());

            password.append(TEMP_PASSWORD_CHARS.charAt(characterIndex));
        }

        return password.toString();
    }
}
