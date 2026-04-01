-- Migration 006: Create scoped agent policies
-- Runs after 005 partially applied (columns added, old policies dropped, new policies missing).
-- Uses DROP ... IF EXISTS before each CREATE so this is safe to re-run.

-- ─── client_profiles ──────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "super admin full access profiles" ON client_profiles;
DROP POLICY IF EXISTS "agents access own profile and clients" ON client_profiles;

CREATE POLICY "super admin full access profiles" ON client_profiles
  FOR ALL TO authenticated
  USING (get_is_super_admin() = TRUE);

CREATE POLICY "agents access own profile and clients" ON client_profiles
  FOR ALL TO authenticated
  USING (
    get_my_role() = 'agent'
    AND get_is_approved() = TRUE
    AND (user_id = auth.uid() OR agent_id = auth.uid())
  );

-- ─── properties ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "super admin full access properties" ON properties;
DROP POLICY IF EXISTS "agents access own clients properties" ON properties;

CREATE POLICY "super admin full access properties" ON properties
  FOR ALL TO authenticated
  USING (get_is_super_admin() = TRUE);

CREATE POLICY "agents access own clients properties" ON properties
  FOR ALL TO authenticated
  USING (
    get_my_role() = 'agent'
    AND get_is_approved() = TRUE
    AND client_id IN (
      SELECT id FROM client_profiles WHERE agent_id = auth.uid()
    )
  );

-- ─── listing_appointments ──────────────────────────────────────────────────────

DROP POLICY IF EXISTS "agents full access appointments" ON listing_appointments;

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

-- ─── market_updates ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "agents full access market_updates" ON market_updates;

CREATE POLICY "agents full access market_updates" ON market_updates
  FOR ALL TO authenticated
  USING (get_my_role() = 'agent' AND get_is_approved() = TRUE);

-- ─── cmas ─────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "agents full access cmas" ON cmas;

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

DROP POLICY IF EXISTS "agents full access prep items" ON property_prep_items;

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

DROP POLICY IF EXISTS "agents full access prep files" ON property_prep_files;

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

DROP POLICY IF EXISTS "agents full access fintrac" ON fintrac_requirements;

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

DROP POLICY IF EXISTS "agents full access showings" ON showings;

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

DROP POLICY IF EXISTS "agents full access deal tasks" ON deal_tasks;

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

DROP POLICY IF EXISTS "agents full access deal task files" ON deal_task_files;

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

DROP POLICY IF EXISTS "agents full access timeline" ON timeline_events;

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

DROP POLICY IF EXISTS "agents full access activity" ON activity_logs;

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

-- ─── property_tasks / property_appointments (if they exist) ───────────────────

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'property_tasks') THEN
    EXECUTE $p$ DROP POLICY IF EXISTS "agents full access property tasks" ON property_tasks $p$;
    EXECUTE $p$
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
    $p$;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'property_appointments') THEN
    EXECUTE $p$ DROP POLICY IF EXISTS "agents full access property appointments" ON property_appointments $p$;
    EXECUTE $p$
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
    $p$;
  END IF;
END $$;
