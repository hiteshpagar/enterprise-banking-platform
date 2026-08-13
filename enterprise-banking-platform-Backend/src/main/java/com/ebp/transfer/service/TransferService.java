package com.ebp.transfer.service;

import java.util.UUID;

import org.springframework.data.domain.Page;

import com.ebp.transfer.dto.CreateTransferRequest;
import com.ebp.transfer.dto.TransferResponse;
import com.ebp.transfer.dto.TransferSummaryResponse;

public interface TransferService {

    TransferResponse createTransfer(
            CreateTransferRequest request);

    TransferResponse getTransferById(
            UUID id);

    Page<TransferSummaryResponse> getTransfersByAccount(
            UUID accountId,
            int page,
            int size);
}