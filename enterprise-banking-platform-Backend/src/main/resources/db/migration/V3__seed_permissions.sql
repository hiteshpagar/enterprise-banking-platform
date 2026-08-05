-- =====================================================================
-- Seed Permissions
-- =====================================================================

-- Create Permissions

INSERT INTO security.permissions (
    module,
    resource,
    action,
    name,
    description
)
VALUES
(
    'USER',
    'USER',
    'CREATE',
    'USER_CREATE',
    'Create User'
),
(
    'USER',
    'USER',
    'READ',
    'USER_VIEW',
    'View User'
),
(
    'USER',
    'USER',
    'UPDATE',
    'USER_UPDATE',
    'Update User'
),
(
    'USER',
    'USER',
    'DELETE',
    'USER_DELETE',
    'Delete User'
);

-- Assign all permissions to SUPER_ADMIN

INSERT INTO security.role_permissions (
    role_id,
    permission_id
)
SELECT
    r.id,
    p.id
FROM security.roles r
CROSS JOIN security.permissions p
WHERE r.name = 'SUPER_ADMIN';