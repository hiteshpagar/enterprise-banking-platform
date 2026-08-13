package com.ebp.transfer.mapper;

import org.springframework.stereotype.Component;

import com.ebp.transfer.dto.TransferResponse;
import com.ebp.transfer.dto.TransferSummaryResponse;
import com.ebp.transfer.entity.Transfer;

@Component
public class TransferMapper {

    public TransferResponse toResponse(Transfer transfer) {

        TransferResponse response = new TransferResponse();

        response.setId(transfer.getId());

        response.setSourceAccountId(
                transfer.getSourceAccount().getId());

        response.setSourceAccountNumber(
                transfer.getSourceAccount().getAccountNumber());

        response.setDestinationAccountId(
                transfer.getDestinationAccount().getId());

        response.setDestinationAccountNumber(
                transfer.getDestinationAccount().getAccountNumber());

        response.setTransferReference(
                transfer.getTransferReference());

        response.setAmount(transfer.getAmount());

        response.setCurrency(transfer.getCurrency());

        response.setStatus(transfer.getStatus());

        response.setDescription(transfer.getDescription());

        response.setCreatedAt(transfer.getCreatedAt());

        return response;
    }

    public TransferSummaryResponse toSummary(
            Transfer transfer) {

        TransferSummaryResponse response =
                new TransferSummaryResponse();

        response.setId(transfer.getId());

        response.setTransferReference(
                transfer.getTransferReference());

        response.setSourceAccountId(
                transfer.getSourceAccount().getId());

        response.setSourceAccountNumber(
                transfer.getSourceAccount().getAccountNumber());

        response.setDestinationAccountId(
                transfer.getDestinationAccount().getId());

        response.setDestinationAccountNumber(
                transfer.getDestinationAccount().getAccountNumber());

        response.setAmount(transfer.getAmount());

        response.setCurrency(transfer.getCurrency());

        response.setStatus(transfer.getStatus());

        response.setCreatedAt(transfer.getCreatedAt());

        return response;
    }
}