-- Migration 008: Fix prep item visibility
-- 1. Add super admin full-access policies for prep_items and prep_files
-- 2. Backfill agent_id on client profiles that have properties but no assigned agent

-- ─── Super admin policies for prep tables ─────────────────────────────────────

DROP POLICY IF EXISTS "super admin full access prep items" ON property_prep_items;
CREATE POLICY "super admin full access prep items" ON property_prep_items
  FOR ALL TO authenticated
  USING (get_is_super_admin() = TRUE);

DROP POLICY IF EXISTS "super admin full access prep files" ON property_prep_files;
CREATE POLICY "super admin full access prep files" ON property_prep_files
  FOR ALL TO authenticated
  USING (get_is_super_admin() = TRUE);

-- ─── Backfill agent_id: assign clients (with null agent_id) to the super admin ─

UPDATE client_profiles
SET agent_id = (
  SELECT user_id FROM client_profiles WHERE is_super_admin = TRUE LIMIT 1
)
WHERE role = 'client'
  AND agent_id IS NULL
  AND id IN (
    SELECT client_id FROM properties
  );
