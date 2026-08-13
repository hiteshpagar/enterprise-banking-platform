-- ============================================================
-- V19 - Assign Beneficiary Permissions to SUPER_ADMIN
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
      'BENEFICIARY_CREATE',
      'BENEFICIARY_VIEW',
      'BENEFICIARY_UPDATE',
      'BENEFICIARY_DELETE'
  )
  AND NOT EXISTS (
      SELECT 1
      FROM security.role_permissions rp
      WHERE rp.role_id = r.id
        AND rp.permission_id = p.id
  );