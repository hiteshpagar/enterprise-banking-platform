-- ============================================================
-- V12 - Add Transaction Permissions
-- ============================================================

INSERT INTO security.permissions
(
    id,
    module,
    resource,
    action,
    name,
    description,
    created_at,
    updated_at,
    version
)
VALUES
(
    gen_random_uuid(),
    'TRANSACTION',
    'TRANSACTION',
    'CREATE',
    'TRANSACTION_DEPOSIT',
    'Permission to create deposit transactions',
    NOW(),
    NOW(),
    0
),
(
    gen_random_uuid(),
    'TRANSACTION',
    'TRANSACTION',
    'CREATE',
    'TRANSACTION_WITHDRAW',
    'Permission to create withdrawal transactions',
    NOW(),
    NOW(),
    0
),
(
    gen_random_uuid(),
    'TRANSACTION',
    'TRANSACTION',
    'VIEW',
    'TRANSACTION_VIEW',
    'Permission to view transactions',
    NOW(),
    NOW(),
    0
)
ON CONFLICT (name) DO NOTHING;