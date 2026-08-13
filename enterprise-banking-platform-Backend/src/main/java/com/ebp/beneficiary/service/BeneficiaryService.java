package com.ebp.beneficiary.service;

import java.util.UUID;

import org.springframework.data.domain.Page;

import com.ebp.beneficiary.dto.BeneficiaryResponse;
import com.ebp.beneficiary.dto.CreateBeneficiaryRequest;
import com.ebp.beneficiary.dto.UpdateBeneficiaryRequest;

public interface BeneficiaryService {

    BeneficiaryResponse createBeneficiary(
            CreateBeneficiaryRequest request);

    BeneficiaryResponse getBeneficiaryById(
            UUID id);

    Page<BeneficiaryResponse> getBeneficiariesByCustomer(
            UUID customerId,
            int page,
            int size);

    BeneficiaryResponse updateBeneficiary(
            UUID id,
            UpdateBeneficiaryRequest request);

    void deleteBeneficiary(UUID id);
}