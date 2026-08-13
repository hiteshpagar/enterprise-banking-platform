-- ============================================================
-- V18 - Add Beneficiary Permissions
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
    'BENEFICIARY',
    'BENEFICIARY',
    'CREATE',
    'BENEFICIARY_CREATE',
    'Permission to create beneficiaries',
    NOW(),
    NOW(),
    0
),
(
    gen_random_uuid(),
    'BENEFICIARY',
    'BENEFICIARY',
    'VIEW',
    'BENEFICIARY_VIEW',
    'Permission to view beneficiaries',
    NOW(),
    NOW(),
    0
),
(
    gen_random_uuid(),
    'BENEFICIARY',
    'BENEFICIARY',
    'UPDATE',
    'BENEFICIARY_UPDATE',
    'Permission to update beneficiaries',
    NOW(),
    NOW(),
    0
),
(
    gen_random_uuid(),
    'BENEFICIARY',
    'BENEFICIARY',
    'DELETE',
    'BENEFICIARY_DELETE',
    'Permission to delete beneficiaries',
    NOW(),
    NOW(),
    0
)
ON CONFLICT (name) DO NOTHING;