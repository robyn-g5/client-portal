-- Property Tasks
CREATE TABLE property_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  due_date TIMESTAMPTZ,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Property Appointments
CREATE TABLE property_appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  appointment_type TEXT NOT NULL DEFAULT 'Showing',
  scheduled_at TIMESTAMPTZ NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_property_tasks_property_id ON property_tasks(property_id);
CREATE INDEX idx_property_appointments_property_id ON property_appointments(property_id);

-- RLS
ALTER TABLE property_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_appointments ENABLE ROW LEVEL SECURITY;

-- Policies for property_tasks
CREATE POLICY "agents full access property tasks" ON property_tasks
  FOR ALL TO authenticated USING (get_my_role() = 'agent');

CREATE POLICY "clients view own property tasks" ON property_tasks
  FOR SELECT TO authenticated
  USING (property_id IN (SELECT id FROM properties WHERE client_id = get_my_profile_id()));

CREATE POLICY "clients update own property tasks" ON property_tasks
  FOR UPDATE TO authenticated
  USING (property_id IN (SELECT id FROM properties WHERE client_id = get_my_profile_id()));

-- Policies for property_appointments
CREATE POLICY "agents full access property appointments" ON property_appointments
  FOR ALL TO authenticated USING (get_my_role() = 'agent');

CREATE POLICY "clients view own property appointments" ON property_appointments
  FOR SELECT TO authenticated
  USING (property_id IN (SELECT id FROM properties WHERE client_id = get_my_profile_id()));
