-- ============================================================
-- V6 - Assign Customer Permissions to ADMIN Role
-- ============================================================

INSERT INTO security.role_permissions
(
    role_id,
    permission_id,
    created_at
)
SELECT
    r.id,
    p.id,
    NOW()
FROM security.roles r
JOIN security.permissions p
    ON p.name IN (
        'CUSTOMER_CREATE',
        'CUSTOMER_VIEW',
        'CUSTOMER_UPDATE',
        'CUSTOMER_DELETE'
    )
WHERE r.name = 'SUPER_ADMIN'
AND NOT EXISTS (
    SELECT 1
    FROM security.role_permissions rp
    WHERE rp.role_id = r.id
      AND rp.permission_id = p.id
);