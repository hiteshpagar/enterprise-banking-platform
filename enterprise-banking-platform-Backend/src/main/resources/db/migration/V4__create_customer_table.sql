-- =====================================================
-- Create Customer Schema
-- =====================================================

CREATE SCHEMA IF NOT EXISTS customer;

-- =====================================================
-- Create Customers Table
-- =====================================================

CREATE TABLE customer.customers (

    id UUID PRIMARY KEY,

    customer_number VARCHAR(20) NOT NULL UNIQUE,

    first_name VARCHAR(100) NOT NULL,

    middle_name VARCHAR(100),

    last_name VARCHAR(100) NOT NULL,

    date_of_birth DATE NOT NULL,

    gender VARCHAR(20) NOT NULL,

    mobile_number VARCHAR(20) NOT NULL UNIQUE,

    email VARCHAR(255) NOT NULL UNIQUE,

    status VARCHAR(30) NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    created_by UUID,

    updated_by UUID,

    version BIGINT NOT NULL DEFAULT 0
);