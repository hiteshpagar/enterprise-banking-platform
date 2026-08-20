package com.ebp.beneficiary.service;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ebp.account.entity.Account;
import com.ebp.account.exception.AccountNotFoundException;
import com.ebp.account.repository.AccountRepository;
import com.ebp.beneficiary.dto.BeneficiaryResponse;
import com.ebp.beneficiary.dto.CreateBeneficiaryRequest;
import com.ebp.beneficiary.dto.CreateCustomerBeneficiaryRequest;
import com.ebp.beneficiary.dto.UpdateBeneficiaryRequest;
import com.ebp.beneficiary.entity.Beneficiary;
import com.ebp.beneficiary.entity.BeneficiaryStatus;
import com.ebp.beneficiary.exception.BeneficiaryAlreadyExistsException;
import com.ebp.beneficiary.exception.BeneficiaryNotFoundException;
import com.ebp.beneficiary.mapper.BeneficiaryMapper;
import com.ebp.beneficiary.repository.BeneficiaryRepository;
import com.ebp.customer.entity.Customer;
import com.ebp.customer.exception.CustomerNotFoundException;
import com.ebp.customer.repository.CustomerRepository;
import com.ebp.user.entity.User;
import com.ebp.user.exception.UserNotFoundException;
import com.ebp.user.repository.UserRepository;

@Service
public class BeneficiaryServiceImpl implements BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final BeneficiaryMapper beneficiaryMapper;
    private final UserRepository userRepository;

    public BeneficiaryServiceImpl(
            BeneficiaryRepository beneficiaryRepository,
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            BeneficiaryMapper beneficiaryMapper,
            UserRepository userRepository) {

        this.beneficiaryRepository = beneficiaryRepository;
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.beneficiaryMapper = beneficiaryMapper;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public BeneficiaryResponse createBeneficiary(
            CreateBeneficiaryRequest request) {

        Customer customer = customerRepository
                .findById(request.getCustomerId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Customer with ID '"
                                        + request.getCustomerId()
                                        + "' not found."));

        Account account = accountRepository
                .findById(request.getAccountId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Account with ID '"
                                        + request.getAccountId()
                                        + "' not found."));

        if (beneficiaryRepository
                .existsByCustomerIdAndAccountId(
                        request.getCustomerId(),
                        request.getAccountId())) {

            throw new BeneficiaryAlreadyExistsException(
                    "Beneficiary already exists for this customer and account.");
        }

        Beneficiary beneficiary =
                beneficiaryMapper.toEntity(request);

        beneficiary.setCustomer(customer);
        beneficiary.setAccount(account);
        beneficiary.setStatus(BeneficiaryStatus.ACTIVE);

        OffsetDateTime now = OffsetDateTime.now();

        beneficiary.setCreatedAt(now);
        beneficiary.setUpdatedAt(now);

        Beneficiary savedBeneficiary =
                beneficiaryRepository.save(beneficiary);

        return mapToResponse(
                savedBeneficiary);
    }

    @Override
    @Transactional(readOnly = true)
    public BeneficiaryResponse getBeneficiaryById(
            UUID id) {

        Beneficiary beneficiary =
                beneficiaryRepository.findById(id)
                        .orElseThrow(() ->
                                new BeneficiaryNotFoundException(
                                        "Beneficiary with ID '"
                                                + id
                                                + "' not found."));

        return mapToResponse(
                beneficiary);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BeneficiaryResponse>
            getBeneficiariesByCustomer(
                    UUID customerId,
                    int page,
                    int size) {

        if (!customerRepository.existsById(customerId)) {
            throw new IllegalArgumentException(
                    "Customer with ID '"
                            + customerId
                            + "' not found.");
        }

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by("createdAt").descending());

        return beneficiaryRepository
                .findByCustomerId(
                        customerId,
                        pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public BeneficiaryResponse updateBeneficiary(
            UUID id,
            UpdateBeneficiaryRequest request) {

        Beneficiary beneficiary =
                beneficiaryRepository.findById(id)
                        .orElseThrow(() ->
                                new BeneficiaryNotFoundException(
                                        "Beneficiary with ID '"
                                                + id
                                                + "' not found."));

        beneficiaryMapper.updateEntity(
                beneficiary,
                request);

        beneficiary.setUpdatedAt(
                OffsetDateTime.now());

        Beneficiary updatedBeneficiary =
                beneficiaryRepository.save(
                        beneficiary);

        return mapToResponse(
                updatedBeneficiary);
    }

    @Override
    @Transactional
    public void deleteBeneficiary(UUID id) {

        Beneficiary beneficiary =
                beneficiaryRepository.findById(id)
                        .orElseThrow(() ->
                                new BeneficiaryNotFoundException(
                                        "Beneficiary with ID '"
                                                + id
                                                + "' not found."));

        beneficiaryRepository.delete(beneficiary);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BeneficiaryResponse> getCurrentCustomerBeneficiaries(
            int page,
            int size,
            String username) {

        Customer customer = getCustomerForUsername(username);

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by("createdAt").descending());

        return beneficiaryRepository
                .findByCustomerId(
                        customer.getId(),
                        pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public BeneficiaryResponse createCustomerBeneficiary(
            CreateCustomerBeneficiaryRequest request,
            String username) {

        Customer customer = getCustomerForUsername(username);

        Account account = null;
        if (request.getAccountNumber() != null && !request.getAccountNumber().isBlank()) {
            account = accountRepository
                    .findByAccountNumber(request.getAccountNumber().trim())
                    .orElse(null);
        }

        if (account == null && request.getAccountId() != null) {
            account = accountRepository
                    .findById(request.getAccountId())
                    .orElse(null);
        }

        if (account == null) {
            throw new AccountNotFoundException(
                    "Beneficiary account '"
                            + request.getAccountNumber()
                            + "' was not found in the bank system.");
        }

        if (beneficiaryRepository
                .existsByCustomerIdAndAccountId(
                        customer.getId(),
                        account.getId())) {

            throw new BeneficiaryAlreadyExistsException(
                    "Beneficiary already exists for this customer and account.");
        }

        Beneficiary beneficiary =
                beneficiaryMapper.toEntity(request);

        beneficiary.setCustomer(customer);
        beneficiary.setAccount(account);
        beneficiary.setAccountNumber(account.getAccountNumber());
        beneficiary.setStatus(BeneficiaryStatus.ACTIVE);

        OffsetDateTime now = OffsetDateTime.now();

        beneficiary.setCreatedAt(now);
        beneficiary.setUpdatedAt(now);

        Beneficiary savedBeneficiary =
                beneficiaryRepository.save(beneficiary);

        return mapToResponse(
                savedBeneficiary);
    }

    @Override
    @Transactional(readOnly = true)
    public BeneficiaryResponse getCustomerBeneficiaryById(
            UUID id,
            String username) {

        Customer customer = getCustomerForUsername(username);

        Beneficiary beneficiary =
                beneficiaryRepository.findById(id)
                        .filter(b -> b.getCustomer().getId().equals(customer.getId()))
                        .orElseThrow(() ->
                                new BeneficiaryNotFoundException(
                                        "Beneficiary with ID '"
                                                + id
                                                + "' not found."));

        return mapToResponse(
                beneficiary);
    }

    @Override
    @Transactional
    public BeneficiaryResponse updateCustomerBeneficiary(
            UUID id,
            UpdateBeneficiaryRequest request,
            String username) {

        Customer customer = getCustomerForUsername(username);

        Beneficiary beneficiary =
                beneficiaryRepository.findById(id)
                        .filter(b -> b.getCustomer().getId().equals(customer.getId()))
                        .orElseThrow(() ->
                                new BeneficiaryNotFoundException(
                                        "Beneficiary with ID '"
                                                + id
                                                + "' not found."));

        beneficiaryMapper.updateEntity(
                beneficiary,
                request);

        beneficiary.setUpdatedAt(
                OffsetDateTime.now());

        Beneficiary updatedBeneficiary =
                beneficiaryRepository.save(
                        beneficiary);

        return mapToResponse(
                updatedBeneficiary);
    }

    @Override
    @Transactional
    public void deleteCustomerBeneficiary(
            UUID id,
            String username) {

        Customer customer = getCustomerForUsername(username);

        Beneficiary beneficiary =
                beneficiaryRepository.findById(id)
                        .filter(b -> b.getCustomer().getId().equals(customer.getId()))
                        .orElseThrow(() ->
                                new BeneficiaryNotFoundException(
                                        "Beneficiary with ID '"
                                                + id
                                                + "' not found."));

        beneficiaryRepository.delete(beneficiary);
    }

    private BeneficiaryResponse mapToResponse(Beneficiary beneficiary) {
        BeneficiaryResponse response = beneficiaryMapper.toResponse(beneficiary);

        if (beneficiary.getAccountNumber() != null && !beneficiary.getAccountNumber().isBlank()) {
            accountRepository.findByAccountNumber(beneficiary.getAccountNumber().trim())
                    .ifPresent(destAccount -> response.setAccountId(destAccount.getId()));
        }

        return response;
    }

    private Customer getCustomerForUsername(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User with username '" + username + "' not found."));

        return customerRepository.findByUser(user)
                .orElseThrow(() ->
                        new CustomerNotFoundException(
                                "Customer profile for authenticated user not found."));
    }
}