-- ============================================================
-- CUSTOMER PERMISSIONS
-- ============================================================

INSERT INTO security.permissions (
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
    'CUSTOMER',
    'CUSTOMER',
    'CREATE',
    'CUSTOMER_CREATE',
    'Create Customer',
    NOW(),
    NOW(),
    0
),
(
    gen_random_uuid(),
    'CUSTOMER',
    'CUSTOMER',
    'READ',
    'CUSTOMER_VIEW',
    'View Customer',
    NOW(),
    NOW(),
    0
),
(
    gen_random_uuid(),
    'CUSTOMER',
    'CUSTOMER',
    'UPDATE',
    'CUSTOMER_UPDATE',
    'Update Customer',
    NOW(),
    NOW(),
    0
),
(
    gen_random_uuid(),
    'CUSTOMER',
    'CUSTOMER',
    'DELETE',
    'CUSTOMER_DELETE',
    'Delete Customer',
    NOW(),
    NOW(),
    0
);