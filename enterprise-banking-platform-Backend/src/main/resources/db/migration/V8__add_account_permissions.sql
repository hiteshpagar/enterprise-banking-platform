-- ============================================================
-- V8 - Add Account Permissions
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
    'ACCOUNT',
    'ACCOUNT',
    'CREATE',
    'ACCOUNT_CREATE',
    'Permission to create accounts',
    NOW(),
    NOW(),
    0
),
(
    gen_random_uuid(),
    'ACCOUNT',
    'ACCOUNT',
    'VIEW',
    'ACCOUNT_VIEW',
    'Permission to view accounts',
    NOW(),
    NOW(),
    0
),
(
    gen_random_uuid(),
    'ACCOUNT',
    'ACCOUNT',
    'UPDATE',
    'ACCOUNT_UPDATE',
    'Permission to update accounts',
    NOW(),
    NOW(),
    0
),
(
    gen_random_uuid(),
    'ACCOUNT',
    'ACCOUNT',
    'DELETE',
    'ACCOUNT_DELETE',
    'Permission to delete accounts',
    NOW(),
    NOW(),
    0
);