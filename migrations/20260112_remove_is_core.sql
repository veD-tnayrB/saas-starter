-- Remove is_core column from projects table
-- This column is being replaced by environment-based email checks for system administration.

ALTER TABLE projects DROP COLUMN IF EXISTS is_core;
