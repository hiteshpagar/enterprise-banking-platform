-- ============================================================
-- V13 - Assign Transaction Permissions to SUPER_ADMIN
-- ============================================================

INSERT INTO security.role_permissions (
    role_id,
    permission_id
)
SELECT
    r.id,
    p.id
FROM security.roles r
CROSS JOIN security.permissions p
WHERE r.name = 'SUPER_ADMIN'
  AND p.name IN (
      'TRANSACTION_DEPOSIT',
      'TRANSACTION_WITHDRAW',
      'TRANSACTION_VIEW'
  )
  AND NOT EXISTS (
      SELECT 1
      FROM security.role_permissions rp
      WHERE rp.role_id = r.id
        AND rp.permission_id = p.id
  );