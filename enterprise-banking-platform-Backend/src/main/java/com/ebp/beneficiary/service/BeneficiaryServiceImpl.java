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
import com.ebp.account.repository.AccountRepository;
import com.ebp.beneficiary.dto.BeneficiaryResponse;
import com.ebp.beneficiary.dto.CreateBeneficiaryRequest;
import com.ebp.beneficiary.dto.UpdateBeneficiaryRequest;
import com.ebp.beneficiary.entity.Beneficiary;
import com.ebp.beneficiary.entity.BeneficiaryStatus;
import com.ebp.beneficiary.exception.BeneficiaryAlreadyExistsException;
import com.ebp.beneficiary.exception.BeneficiaryNotFoundException;
import com.ebp.beneficiary.mapper.BeneficiaryMapper;
import com.ebp.beneficiary.repository.BeneficiaryRepository;
import com.ebp.customer.entity.Customer;
import com.ebp.customer.repository.CustomerRepository;

@Service
public class BeneficiaryServiceImpl implements BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final BeneficiaryMapper beneficiaryMapper;

    public BeneficiaryServiceImpl(
            BeneficiaryRepository beneficiaryRepository,
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            BeneficiaryMapper beneficiaryMapper) {

        this.beneficiaryRepository = beneficiaryRepository;
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.beneficiaryMapper = beneficiaryMapper;
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

        return beneficiaryMapper.toResponse(
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

        return beneficiaryMapper.toResponse(
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
                .map(beneficiaryMapper::toResponse);
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

        return beneficiaryMapper.toResponse(
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
}