-- ============================================================
-- V15 - Add Transfer Permissions
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
    'TRANSFER',
    'TRANSFER',
    'CREATE',
    'TRANSFER_CREATE',
    'Permission to create fund transfers',
    NOW(),
    NOW(),
    0
),
(
    gen_random_uuid(),
    'TRANSFER',
    'TRANSFER',
    'VIEW',
    'TRANSFER_VIEW',
    'Permission to view fund transfers',
    NOW(),
    NOW(),
    0
)
ON CONFLICT (name) DO NOTHING;