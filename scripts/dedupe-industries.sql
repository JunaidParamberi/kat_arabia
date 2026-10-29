-- Moves the seven short-title industries left over from an earlier seed to the trash.
-- The seed now owns the 14 brochure sectors; these duplicated their numbers.
-- Soft delete only (deleted_at), so entries can be restored from the admin trash.
--
-- Local:      sqlite3 data.db < scripts/dedupe-industries.sql
-- Production: npx wrangler d1 execute <DB_NAME> --remote --file scripts/dedupe-industries.sql
UPDATE ec_industries
SET deleted_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    status = 'draft'
WHERE deleted_at IS NULL
  AND slug IN ('infrastructure', 'oil-gas', 'energy', 'mining', 'commercial', 'government', 'renewables');
