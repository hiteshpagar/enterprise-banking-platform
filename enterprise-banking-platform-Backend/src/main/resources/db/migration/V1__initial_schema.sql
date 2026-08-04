-- =====================================================================
-- Enterprise Banking Platform (EBP)
-- Initial Database Schema
-- Version : V1
-- Description : Security Module (Authentication & Authorization)
-- =====================================================================

-- =====================================================================
-- Extensions
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- Schemas
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS security;

-- =====================================================================
-- USERS
-- =====================================================================

CREATE TABLE security.users
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    credentials_non_expired BOOLEAN NOT NULL DEFAULT TRUE,

    last_login TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    created_by UUID,
    updated_by UUID,

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email UNIQUE (email),

    CONSTRAINT chk_users_username
        CHECK (char_length(trim(username)) > 0),

    CONSTRAINT chk_users_email
        CHECK (char_length(trim(email)) > 0)
);

COMMENT ON TABLE security.users IS
'Stores authentication users for the Enterprise Banking Platform.';

COMMENT ON COLUMN security.users.password_hash IS
'BCrypt/Argon2 hashed password. Never stores plain text passwords.';

-- =====================================================================
-- ROLES
-- =====================================================================

CREATE TABLE security.roles
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),

    is_system BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    created_by UUID,
    updated_by UUID,

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT uk_roles_name UNIQUE (name),

    CONSTRAINT chk_roles_name
        CHECK (char_length(trim(name)) > 0)
);

COMMENT ON TABLE security.roles IS
'Stores application roles. Example: SUPER_ADMIN, BRANCH_MANAGER, CASHIER.';

-- =====================================================================
-- PERMISSIONS
-- =====================================================================

CREATE TABLE security.permissions
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    module VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,

    name VARCHAR(150) NOT NULL,
    description VARCHAR(500),

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    created_by UUID,
    updated_by UUID,

    version BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT uk_permissions_name UNIQUE (name),

    CONSTRAINT chk_permissions_name
        CHECK (char_length(trim(name)) > 0),

    CONSTRAINT chk_permissions_module
        CHECK (char_length(trim(module)) > 0),

    CONSTRAINT chk_permissions_resource
        CHECK (char_length(trim(resource)) > 0),

    CONSTRAINT chk_permissions_action
        CHECK (char_length(trim(action)) > 0)
);

COMMENT ON TABLE security.permissions IS
'Stores fine-grained application permissions.';

-- =====================================================================
-- USER ROLES
-- =====================================================================

CREATE TABLE security.user_roles
(
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_user_roles
        PRIMARY KEY (user_id, role_id),

    CONSTRAINT fk_user_roles_user
        FOREIGN KEY (user_id)
        REFERENCES security.users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_roles_role
        FOREIGN KEY (role_id)
        REFERENCES security.roles(id)
        ON DELETE CASCADE
);

COMMENT ON TABLE security.user_roles IS
'Associates users with one or more roles.';

-- =====================================================================
-- ROLE PERMISSIONS
-- =====================================================================

CREATE TABLE security.role_permissions
(
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_role_permissions
        PRIMARY KEY (role_id, permission_id),

    CONSTRAINT fk_role_permissions_role
        FOREIGN KEY (role_id)
        REFERENCES security.roles(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_role_permissions_permission
        FOREIGN KEY (permission_id)
        REFERENCES security.permissions(id)
        ON DELETE CASCADE
);

COMMENT ON TABLE security.role_permissions IS
'Associates roles with one or more permissions.';

-- =====================================================================
-- INDEXES
-- =====================================================================

CREATE INDEX idx_users_username
    ON security.users (username);

CREATE INDEX idx_users_email
    ON security.users (email);

CREATE INDEX idx_roles_name
    ON security.roles (name);

CREATE INDEX idx_permissions_name
    ON security.permissions (name);

CREATE INDEX idx_permissions_module
    ON security.permissions (module);

CREATE INDEX idx_permissions_resource
    ON security.permissions (resource);

CREATE INDEX idx_permissions_action
    ON security.permissions (action);

CREATE INDEX idx_user_roles_role
    ON security.user_roles (role_id);

CREATE INDEX idx_role_permissions_permission
    ON security.role_permissions (permission_id);