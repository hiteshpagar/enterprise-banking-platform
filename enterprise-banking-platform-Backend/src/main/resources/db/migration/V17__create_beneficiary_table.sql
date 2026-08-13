-- ============================================================
-- V17 - Create Beneficiary Table
-- ============================================================

CREATE SCHEMA IF NOT EXISTS beneficiary;

CREATE TABLE beneficiary.beneficiaries (

    id UUID PRIMARY KEY,

    customer_id UUID NOT NULL,

    account_id UUID NOT NULL,

    beneficiary_name VARCHAR(150) NOT NULL,

    bank_name VARCHAR(150),

    account_number VARCHAR(30) NOT NULL,

    status VARCHAR(20) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL,

    updated_at TIMESTAMPTZ NOT NULL,

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT fk_beneficiary_customer
        FOREIGN KEY (customer_id)
        REFERENCES customer.customers(id),

    CONSTRAINT fk_beneficiary_account
        FOREIGN KEY (account_id)
        REFERENCES account.accounts(id)
);

CREATE INDEX idx_beneficiary_customer_id
ON beneficiary.beneficiaries(customer_id);

CREATE INDEX idx_beneficiary_account_id
ON beneficiary.beneficiaries(account_id);

CREATE INDEX idx_beneficiary_status
ON beneficiary.beneficiaries(status);