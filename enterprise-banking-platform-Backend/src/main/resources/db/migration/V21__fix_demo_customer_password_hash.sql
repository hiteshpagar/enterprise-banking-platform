-- ============================================================
-- V21 - Fix Demo Customer Password Hash
-- ============================================================

-- Demo password: password
UPDATE security.users
SET
    password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZAgcfl7p92ldGxad68LJZdL17lhWy',
    updated_at = NOW()
WHERE username = 'customer';
