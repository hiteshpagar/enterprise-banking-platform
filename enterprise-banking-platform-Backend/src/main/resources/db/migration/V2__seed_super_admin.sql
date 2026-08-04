-- =====================================================================
-- Seed Initial Super Admin
-- =====================================================================

-- ---------------------------------------------------------------------
-- Create SUPER_ADMIN Role
-- ---------------------------------------------------------------------

INSERT INTO security.roles (
    name,
    description,
    is_system
)
VALUES (
    'SUPER_ADMIN',
    'System Super Administrator',
    TRUE
);

-- ---------------------------------------------------------------------
-- Create Admin User
-- ---------------------------------------------------------------------

INSERT INTO security.users (
    username,
    email,
    password_hash,
    enabled,
    account_non_locked,
    account_non_expired,
    credentials_non_expired
)
VALUES (
    'admin',
    'admin@ebp.local',
    '$2a$10$mBetJsTggADoOFjJs0IGtu2JXPE1K63eXmgBd.hrMiOSbudefURuG',
    TRUE,
    TRUE,
    TRUE,
    TRUE
);

-- ---------------------------------------------------------------------
-- Assign SUPER_ADMIN Role
-- ---------------------------------------------------------------------

INSERT INTO security.user_roles (
    user_id,
    role_id
)
SELECT
    u.id,
    r.id
FROM security.users u
JOIN security.roles r
ON r.name = 'SUPER_ADMIN'
WHERE u.username = 'admin';