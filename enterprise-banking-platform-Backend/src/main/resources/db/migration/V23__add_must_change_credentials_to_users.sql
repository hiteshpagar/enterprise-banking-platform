-- =====================================================================
-- Enterprise Banking Platform (EBP)
-- Migration: V23
-- Description: Add must_change_credentials column to security.users
-- =====================================================================

ALTER TABLE security.users
ADD COLUMN must_change_credentials BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN security.users.must_change_credentials IS
'Indicates whether the user must change their temporary credentials before accessing the system.';
