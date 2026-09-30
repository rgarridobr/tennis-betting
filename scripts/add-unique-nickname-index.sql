-- Prevent two active accounts from using the same nickname.
-- Comparison is case-insensitive and ignores surrounding spaces.
--
-- Before applying this migration, resolve any rows returned by:
-- SELECT LOWER(BTRIM(nickname)), COUNT(*)
-- FROM users
-- WHERE nickname IS NOT NULL
--   AND BTRIM(nickname) <> ''
--   AND (is_deleted IS FALSE OR is_deleted IS NULL)
-- GROUP BY LOWER(BTRIM(nickname))
-- HAVING COUNT(*) > 1;

CREATE UNIQUE INDEX IF NOT EXISTS users_nickname_unique_ci
  ON users (LOWER(BTRIM(nickname)))
  WHERE nickname IS NOT NULL
    AND BTRIM(nickname) <> ''
    AND (is_deleted IS FALSE OR is_deleted IS NULL);
