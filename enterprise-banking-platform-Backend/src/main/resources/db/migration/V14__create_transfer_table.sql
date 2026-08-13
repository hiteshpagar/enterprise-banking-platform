-- ============================================================
-- V14 - Create Transfer Table
-- ============================================================

CREATE SCHEMA IF NOT EXISTS transfer;

CREATE TABLE transfer.transfers (

    id UUID PRIMARY KEY,

    source_account_id UUID NOT NULL,

    destination_account_id UUID NOT NULL,

    transfer_reference VARCHAR(30) NOT NULL UNIQUE,

    amount NUMERIC(19,2) NOT NULL,

    currency VARCHAR(10) NOT NULL,

    status VARCHAR(20) NOT NULL,

    description VARCHAR(255),

    created_at TIMESTAMPTZ NOT NULL,

    created_by UUID,

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_transfer_source_account
        FOREIGN KEY (source_account_id)
        REFERENCES account.accounts(id),

    CONSTRAINT fk_transfer_destination_account
        FOREIGN KEY (destination_account_id)
        REFERENCES account.accounts(id),

    CONSTRAINT chk_transfer_amount
        CHECK (amount > 0),

    CONSTRAINT chk_transfer_different_accounts
        CHECK (source_account_id <> destination_account_id)
);

CREATE INDEX idx_transfer_source_account
ON transfer.transfers(source_account_id);

CREATE INDEX idx_transfer_destination_account
ON transfer.transfers(destination_account_id);

CREATE INDEX idx_transfer_reference
ON transfer.transfers(transfer_reference);

CREATE INDEX idx_transfer_status
ON transfer.transfers(status);

CREATE INDEX idx_transfer_created_at
ON transfer.transfers(created_at);