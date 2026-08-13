package com.ebp.beneficiary.dto;

import com.ebp.beneficiary.entity.BeneficiaryStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateBeneficiaryRequest {

    @NotBlank(message = "Beneficiary name is required")
    @Size(max = 150, message = "Beneficiary name must not exceed 150 characters")
    private String beneficiaryName;

    @Size(max = 150, message = "Bank name must not exceed 150 characters")
    private String bankName;

    @NotNull(message = "Status is required")
    private BeneficiaryStatus status;

    public String getBeneficiaryName() {
        return beneficiaryName;
    }

    public void setBeneficiaryName(String beneficiaryName) {
        this.beneficiaryName = beneficiaryName;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public BeneficiaryStatus getStatus() {
        return status;
    }

    public void setStatus(BeneficiaryStatus status) {
        this.status = status;
    }
}