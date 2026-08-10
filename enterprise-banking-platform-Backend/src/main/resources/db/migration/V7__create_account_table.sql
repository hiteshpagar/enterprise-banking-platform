-- ============================================================
-- V7 - Create Account Table
-- ============================================================

CREATE SCHEMA IF NOT EXISTS account;

CREATE TABLE account.accounts (

    id UUID PRIMARY KEY,

    customer_id UUID NOT NULL,

    account_number VARCHAR(20) NOT NULL UNIQUE,

    account_type VARCHAR(20) NOT NULL,

    currency VARCHAR(10) NOT NULL,

    balance NUMERIC(19,2) NOT NULL DEFAULT 0,

    status VARCHAR(20) NOT NULL,

    opened_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ NOT NULL,

    updated_at TIMESTAMPTZ NOT NULL,

    created_by UUID,

    updated_by UUID,

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_account_customer
        FOREIGN KEY (customer_id)
        REFERENCES customer.customers(id)
);

CREATE INDEX idx_account_customer
ON account.accounts(customer_id);

CREATE INDEX idx_account_number
ON account.accounts(account_number);

CREATE INDEX idx_account_status
ON account.accounts(status);

-- ============================================================
-- Account Number Sequence
-- ============================================================

CREATE SEQUENCE account.account_number_seq
    START WITH 100000000001
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



