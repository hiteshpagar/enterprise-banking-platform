-- ============================================================
-- V11 - Create Transaction Table
-- ============================================================

CREATE SCHEMA IF NOT EXISTS transaction;

CREATE TABLE transaction.transactions (

    id UUID PRIMARY KEY,

    account_id UUID NOT NULL,

    transaction_reference VARCHAR(30) NOT NULL UNIQUE,

    transaction_type VARCHAR(20) NOT NULL,

    amount NUMERIC(19,2) NOT NULL,

    currency VARCHAR(10) NOT NULL,

    balance_before NUMERIC(19,2) NOT NULL,

    balance_after NUMERIC(19,2) NOT NULL,

    status VARCHAR(20) NOT NULL,

    description VARCHAR(255),

    created_at TIMESTAMPTZ NOT NULL,

    created_by UUID,

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_transaction_account
        FOREIGN KEY (account_id)
        REFERENCES account.accounts(id),

    CONSTRAINT chk_transaction_amount
        CHECK (amount > 0),

    CONSTRAINT chk_transaction_balance_before
        CHECK (balance_before >= 0),

    CONSTRAINT chk_transaction_balance_after
        CHECK (balance_after >= 0)
);

CREATE INDEX idx_transaction_account
ON transaction.transactions(account_id);

CREATE INDEX idx_transaction_reference
ON transaction.transactions(transaction_reference);

CREATE INDEX idx_transaction_type
ON transaction.transactions(transaction_type);

CREATE INDEX idx_transaction_status
ON transaction.transactions(status);

CREATE INDEX idx_transaction_created_at
ON transaction.transactions(created_at);