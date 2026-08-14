-- ============================================================
-- V22 - Correct Demo Customer Password Hash
-- ============================================================

-- Demo password: password
UPDATE security.users
SET
    password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    enabled = TRUE,
    account_non_locked = TRUE,
    account_non_expired = TRUE,
    credentials_non_expired = TRUE,
    updated_at = NOW()
WHERE username = 'customer';
