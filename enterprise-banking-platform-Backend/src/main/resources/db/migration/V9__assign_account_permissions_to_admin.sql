-- ============================================================
-- V9 - Assign Account Permissions to ADMIN Role
-- ============================================================

INSERT INTO security.role_permissions
(
    role_id,
    permission_id
)
SELECT
    r.id,
    p.id
FROM security.roles r
JOIN security.permissions p
    ON p.name IN (
        'ACCOUNT_CREATE',
        'ACCOUNT_VIEW',
        'ACCOUNT_UPDATE',
        'ACCOUNT_DELETE'
    )
WHERE r.name = 'SUPER_ADMIN'
AND NOT EXISTS (
    SELECT 1
    FROM security.role_permissions rp
    WHERE rp.role_id = r.id
      AND rp.permission_id = p.id
);