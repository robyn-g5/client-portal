-- Migration 005: Agent isolation, approval flow, and super-admin
-- Adds agent_id (which agent owns a client), is_approved (agent account gate),
-- and is_super_admin (for robyn@imuskoka.com only).

-- ─── Schema changes ────────────────────────────────────────────────────────────

ALTER TABLE client_profiles
  ADD COLUMN agent_id UUID REFERENCES auth.users(id),
  ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN is_super_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Grandfather existing agent accounts as approved
UPDATE client_profiles SET is_approved = TRUE WHERE role = 'agent';

-- Grant super-admin to robyn@imuskoka.com (if her account exists)
UPDATE client_profiles
SET is_super_admin = TRUE
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'robyn@imuskoka.com'
);

CREATE INDEX idx_client_profiles_agent_id ON client_profiles(agent_id);

-- ─── Helper functions ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_is_approved()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(is_approved, FALSE) FROM client_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(is_super_admin, FALSE) FROM client_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ─── Drop old broad agent policies (replace with scoped ones below) ────────────

DROP POLICY IF EXISTS "agents can do everything on profiles" ON client_profiles;
DROP POLICY IF EXISTS "agents can do everything on properties" ON properties;
DROP POLICY IF EXISTS "agents full access appointments" ON listing_appointments;
DROP POLICY IF EXISTS "agents full access market_updates" ON market_updates;
DROP POLICY IF EXISTS "agents full access cmas" ON cmas;
DROP POLICY IF EXISTS "agents full access prep items" ON property_prep_items;
DROP POLICY IF EXISTS "agents full access prep files" ON property_prep_files;
DROP POLICY IF EXISTS "agents full access fintrac" ON fintrac_requirements;
DROP POLICY IF EXISTS "agents full access showings" ON showings;
DROP POLICY IF EXISTS "agents full access deal tasks" ON deal_tasks;
DROP POLICY IF EXISTS "agents full access deal task files" ON deal_task_files;
DROP POLICY IF EXISTS "agents full access timeline" ON timeline_events;
DROP POLICY IF EXISTS "agents full access activity" ON activity_logs;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'property_tasks') THEN
    DROP POLICY IF EXISTS "agents full access property tasks" ON property_tasks;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'property_appointments') THEN
    DROP POLICY IF EXISTS "agents full access property appointments" ON property_appointments;
  END IF;
END $$;

-- ─── client_profiles ──────────────────────────────────────────────────────────

-- Super admin sees and manages everything
CREATE POLICY "super admin full access profiles" ON client_profiles
  FOR ALL TO authenticated
  USING (get_is_super_admin() = TRUE);

-- Approved agents see their own profile + profiles of clients assigned to them
CREATE POLICY "agents access own profile and clients" ON client_profiles
  FOR ALL TO authenticated
  USING (
    get_my_role() = 'agent'
    AND get_is_approved() = TRUE
    AND (user_id = auth.uid() OR agent_id = auth.uid())
  );

-- ─── properties ───────────────────────────────────────────────────────────────

CREATE POLICY "super admin full access properties" ON properties
  FOR ALL TO authenticated
  USING (get_is_super_admin() = TRUE);

-- Agents only see properties belonging to their own clients
CREATE POLICY "agents access own clients properties" ON properties
  FOR ALL TO authenticated
  USING (
    get_my_role() = 'agent'
    AND get_is_approved() = TRUE
    AND client_id IN (
      SELECT id FROM client_profiles WHERE agent_id = auth.uid()
    )
  );

-- ─── Shared subquery helper (properties scoped to current agent) ───────────────
-- Used inline in each policy below.

-- ─── listing_appointments ──────────────────────────────────────────────────────

CREATE POLICY "agents full access appointments" ON listing_appointments
  FOR ALL TO authenticated
  USING (
    get_my_role() = 'agent'
    AND get_is_approved() = TRUE
    AND property_id IN (
      SELECT p.id FROM properties p
      JOIN client_profiles cp ON cp.id = p.client_id
      WHERE cp.agent_id = auth.uid()
    )
  );

-- ─── market_updates (global — any approved agent) ─────────────────────────────

CREATE POLICY "agents full access market_updates" ON market_updates
  FOR ALL TO authenticated
  USING (get_my_role() = 'agent' AND get_is_approved() = TRUE);

-- ─── cmas ─────────────────────────────────────────────────────────────────────

CREATE POLICY "agents full access cmas" ON cmas
  FOR ALL TO authenticated
  USING (
    get_my_role() = 'agent'
    AND get_is_approved() = TRUE
    AND property_id IN (
      SELECT p.id FROM properties p
      JOIN client_profiles cp ON cp.id = p.client_id
      WHERE cp.agent_id = auth.uid()
    )
  );

-- ─── property_prep_items ──────────────────────────────────────────────────────

CREATE POLICY "agents full access prep items" ON property_prep_items
  FOR ALL TO authenticated
  USING (
    get_my_role() = 'agent'
    AND get_is_approved() = TRUE
    AND property_id IN (
      SELECT p.id FROM properties p
      JOIN client_profiles cp ON cp.id = p.client_id
      WHERE cp.agent_id = auth.uid()
    )
  );

-- ─── property_prep_files ──────────────────────────────────────────────────────

CREATE POLICY "agents full access prep files" ON property_prep_files
  FOR ALL TO authenticated
  USING (
    get_my_role() = 'agent'
    AND get_is_approved() = TRUE
    AND prep_item_id IN (
      SELECT ppi.id FROM property_prep_items ppi
      JOIN properties p ON p.id = ppi.property_id
      JOIN client_profiles cp ON cp.id = p.client_id
      WHERE cp.agent_id = auth.uid()
    )
  );

-- ─── fintrac_requirements ─────────────────────────────────────────────────────

CREATE POLICY "agents full access fintrac" ON fintrac_requirements
  FOR ALL TO authenticated
  USING (
    get_my_role() = 'agent'
    AND get_is_approved() = TRUE
    AND property_id IN (
      SELECT p.id FROM properties p
      JOIN client_profiles cp ON cp.id = p.client_id
      WHERE cp.agent_id = auth.uid()
    )
  );

-- ─── showings ─────────────────────────────────────────────────────────────────

CREATE POLICY "agents full access showings" ON showings
  FOR ALL TO authenticated
  USING (
    get_my_role() = 'agent'
    AND get_is_approved() = TRUE
    AND property_id IN (
      SELECT p.id FROM properties p
      JOIN client_profiles cp ON cp.id = p.client_id
      WHERE cp.agent_id = auth.uid()
    )
  );

-- ─── deal_tasks ───────────────────────────────────────────────────────────────

CREATE POLICY "agents full access deal tasks" ON deal_tasks
  FOR ALL TO authenticated
  USING (
    get_my_role() = 'agent'
    AND get_is_approved() = TRUE
    AND property_id IN (
      SELECT p.id FROM properties p
      JOIN client_profiles cp ON cp.id = p.client_id
      WHERE cp.agent_id = auth.uid()
    )
  );

-- ─── deal_task_files ──────────────────────────────────────────────────────────

CREATE POLICY "agents full access deal task files" ON deal_task_files
  FOR ALL TO authenticated
  USING (
    get_my_role() = 'agent'
    AND get_is_approved() = TRUE
    AND deal_task_id IN (
      SELECT dt.id FROM deal_tasks dt
      JOIN properties p ON p.id = dt.property_id
      JOIN client_profiles cp ON cp.id = p.client_id
      WHERE cp.agent_id = auth.uid()
    )
  );

-- ─── timeline_events ──────────────────────────────────────────────────────────

CREATE POLICY "agents full access timeline" ON timeline_events
  FOR ALL TO authenticated
  USING (
    get_my_role() = 'agent'
    AND get_is_approved() = TRUE
    AND property_id IN (
      SELECT p.id FROM properties p
      JOIN client_profiles cp ON cp.id = p.client_id
      WHERE cp.agent_id = auth.uid()
    )
  );

-- ─── activity_logs ────────────────────────────────────────────────────────────

CREATE POLICY "agents full access activity" ON activity_logs
  FOR ALL TO authenticated
  USING (
    get_my_role() = 'agent'
    AND get_is_approved() = TRUE
    AND property_id IN (
      SELECT p.id FROM properties p
      JOIN client_profiles cp ON cp.id = p.client_id
      WHERE cp.agent_id = auth.uid()
    )
  );

-- ─── property_tasks / property_appointments (created in migration 004) ────────
-- Wrapped in DO blocks in case migration 004 has not yet been applied.

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'property_tasks') THEN
    EXECUTE $policy$
      CREATE POLICY "agents full access property tasks" ON property_tasks
        FOR ALL TO authenticated
        USING (
          get_my_role() = 'agent'
          AND get_is_approved() = TRUE
          AND property_id IN (
            SELECT p.id FROM properties p
            JOIN client_profiles cp ON cp.id = p.client_id
            WHERE cp.agent_id = auth.uid()
          )
        )
    $policy$;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'property_appointments') THEN
    EXECUTE $policy$
      CREATE POLICY "agents full access property appointments" ON property_appointments
        FOR ALL TO authenticated
        USING (
          get_my_role() = 'agent'
          AND get_is_approved() = TRUE
          AND property_id IN (
            SELECT p.id FROM properties p
            JOIN client_profiles cp ON cp.id = p.client_id
            WHERE cp.agent_id = auth.uid()
          )
        )
    $policy$;
  END IF;
END $$;
