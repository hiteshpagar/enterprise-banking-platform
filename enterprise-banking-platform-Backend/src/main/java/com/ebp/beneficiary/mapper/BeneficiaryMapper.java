package com.ebp.beneficiary.mapper;

import org.springframework.stereotype.Component;

import com.ebp.beneficiary.dto.BeneficiaryResponse;
import com.ebp.beneficiary.dto.CreateBeneficiaryRequest;
import com.ebp.beneficiary.dto.CreateCustomerBeneficiaryRequest;
import com.ebp.beneficiary.dto.UpdateBeneficiaryRequest;
import com.ebp.beneficiary.entity.Beneficiary;

@Component
public class BeneficiaryMapper {

    public Beneficiary toEntity(
            CreateBeneficiaryRequest request) {

        Beneficiary beneficiary = new Beneficiary();

        beneficiary.setBeneficiaryName(
                request.getBeneficiaryName());

        beneficiary.setBankName(
                request.getBankName());

        beneficiary.setAccountNumber(
                request.getAccountNumber());

        return beneficiary;
    }

    public Beneficiary toEntity(
            CreateCustomerBeneficiaryRequest request) {

        Beneficiary beneficiary = new Beneficiary();

        beneficiary.setBeneficiaryName(
                request.getBeneficiaryName());

        beneficiary.setBankName(
                request.getBankName());

        beneficiary.setAccountNumber(
                request.getAccountNumber());

        return beneficiary;
    }

    public BeneficiaryResponse toResponse(
            Beneficiary beneficiary) {

        BeneficiaryResponse response =
                new BeneficiaryResponse();

        response.setId(beneficiary.getId());

        response.setCustomerId(
                beneficiary.getCustomer().getId());

        response.setAccountId(
                beneficiary.getAccount().getId());

        response.setBeneficiaryName(
                beneficiary.getBeneficiaryName());

        response.setBankName(
                beneficiary.getBankName());

        response.setAccountNumber(
                beneficiary.getAccountNumber());

        response.setStatus(
                beneficiary.getStatus());

        response.setCreatedAt(
                beneficiary.getCreatedAt());

        response.setUpdatedAt(
                beneficiary.getUpdatedAt());

        return response;
    }

    public void updateEntity(
            Beneficiary beneficiary,
            UpdateBeneficiaryRequest request) {

        beneficiary.setBeneficiaryName(
                request.getBeneficiaryName());

        beneficiary.setBankName(
                request.getBankName());

        beneficiary.setStatus(
                request.getStatus());
    }
}