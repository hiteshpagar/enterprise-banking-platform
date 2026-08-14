-- ============================================================
-- V20 - Seed Customer Role, Demo Customer User, and Account
-- ============================================================

ALTER TABLE customer.customers
ADD COLUMN IF NOT EXISTS user_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_customer_user'
    ) THEN
        ALTER TABLE customer.customers
        ADD CONSTRAINT fk_customer_user
        FOREIGN KEY (user_id)
        REFERENCES security.users(id);
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uk_customers_user_id
ON customer.customers(user_id)
WHERE user_id IS NOT NULL;

INSERT INTO security.roles (
    id,
    name,
    description,
    is_system,
    created_at,
    updated_at,
    version
)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'CUSTOMER',
    'Retail banking customer',
    TRUE,
    NOW(),
    NOW(),
    0
)
ON CONFLICT (name) DO NOTHING;

-- Demo password: password
-- This seeded user is intended for local development/testing only.
INSERT INTO security.users (
    id,
    username,
    email,
    password_hash,
    enabled,
    account_non_locked,
    account_non_expired,
    credentials_non_expired,
    created_at,
    updated_at,
    version
)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'customer',
    'customer@ebp.local',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    NOW(),
    NOW(),
    0
)
ON CONFLICT (username) DO NOTHING;

INSERT INTO security.user_roles (
    user_id,
    role_id,
    created_at
)
SELECT
    u.id,
    r.id,
    NOW()
FROM security.users u
JOIN security.roles r
    ON r.name = 'CUSTOMER'
WHERE u.username = 'customer'
AND NOT EXISTS (
    SELECT 1
    FROM security.user_roles ur
    WHERE ur.user_id = u.id
      AND ur.role_id = r.id
);

INSERT INTO customer.customers (
    id,
    user_id,
    customer_number,
    first_name,
    middle_name,
    last_name,
    date_of_birth,
    gender,
    mobile_number,
    email,
    status,
    created_at,
    updated_at,
    version
)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'CUST000001',
    'Demo',
    NULL,
    'Customer',
    '1990-01-01',
    'OTHER',
    '+15550001001',
    'customer@ebp.local',
    'ACTIVE',
    NOW(),
    NOW(),
    0
)
ON CONFLICT (customer_number) DO NOTHING;

INSERT INTO account.accounts (
    id,
    customer_id,
    account_number,
    account_type,
    currency,
    balance,
    status,
    opened_at,
    created_at,
    updated_at,
    version
)
VALUES (
    '44444444-4444-4444-4444-444444444444',
    '33333333-3333-3333-3333-333333333333',
    '100000000001',
    'SAVINGS',
    'USD',
    2500.00,
    'ACTIVE',
    NOW(),
    NOW(),
    NOW(),
    0
)
ON CONFLICT (account_number) DO NOTHING;

SELECT setval(
    'account.account_number_seq',
    GREATEST(
        (
            SELECT COALESCE(MAX(account_number::BIGINT), 100000000000)
            FROM account.accounts
            WHERE account_number ~ '^[0-9]+$'
        ),
        (
            SELECT last_value
            FROM account.account_number_seq
        )
    ),
    TRUE
);
