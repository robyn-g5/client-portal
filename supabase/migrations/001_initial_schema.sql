-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Client Profiles (linked to Supabase auth.users)
CREATE TABLE client_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('agent', 'client')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Properties
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'conditional', 'sold')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Listing Appointments
CREATE TABLE listing_appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Market Updates (global, latest shown)
CREATE TABLE market_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  attachment_url TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CMAs
CREATE TABLE cmas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Checklist Templates
CREATE TABLE checklist_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE checklist_template_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Property Prep Items
CREATE TABLE property_prep_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  template_item_id UUID REFERENCES checklist_template_items(id),
  label TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  notes TEXT,
  created_by TEXT NOT NULL DEFAULT 'agent' CHECK (created_by IN ('agent', 'client')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Property Prep Files
CREATE TABLE property_prep_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prep_item_id UUID NOT NULL REFERENCES property_prep_items(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FINTRAC Requirements
CREATE TABLE fintrac_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('FINTRAC', 'RECO_GUIDE')),
  status TEXT NOT NULL DEFAULT 'required' CHECK (status IN ('required', 'uploaded')),
  file_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Showings
CREATE TABLE showings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  showing_date TIMESTAMPTZ NOT NULL,
  agent_name TEXT NOT NULL,
  feedback_status TEXT NOT NULL DEFAULT 'Requested' CHECK (feedback_status IN ('Requested', 'Received', 'No Response')),
  feedback_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deal Tasks
CREATE TABLE deal_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  party TEXT NOT NULL CHECK (party IN ('buyer', 'seller', 'agent')),
  is_conditional BOOLEAN NOT NULL DEFAULT false,
  due_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deal Task Files
CREATE TABLE deal_task_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_task_id UUID NOT NULL REFERENCES deal_tasks(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Timeline Events
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('milestone', 'task', 'document', 'showing')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity Log
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_properties_client_id ON properties(client_id);
CREATE INDEX idx_prep_items_property_id ON property_prep_items(property_id);
CREATE INDEX idx_prep_files_prep_item_id ON property_prep_files(prep_item_id);
CREATE INDEX idx_showings_property_id ON showings(property_id);
CREATE INDEX idx_deal_tasks_property_id ON deal_tasks(property_id);
CREATE INDEX idx_timeline_property_id ON timeline_events(property_id);
CREATE INDEX idx_activity_property_id ON activity_logs(property_id);
CREATE INDEX idx_market_updates_published ON market_updates(published_at DESC);

-- RLS Policies
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_prep_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_prep_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE fintrac_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE showings ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_task_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM client_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: get current user's client_profile id
CREATE OR REPLACE FUNCTION get_my_profile_id()
RETURNS UUID AS $$
  SELECT id FROM client_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- client_profiles policies
CREATE POLICY "agents can do everything on profiles" ON client_profiles
  FOR ALL TO authenticated
  USING (get_my_role() = 'agent');

CREATE POLICY "clients can view own profile" ON client_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- properties policies
CREATE POLICY "agents can do everything on properties" ON properties
  FOR ALL TO authenticated
  USING (get_my_role() = 'agent');

CREATE POLICY "clients can view own properties" ON properties
  FOR SELECT TO authenticated
  USING (client_id = get_my_profile_id());

-- listing_appointments
CREATE POLICY "agents full access appointments" ON listing_appointments
  FOR ALL TO authenticated USING (get_my_role() = 'agent');

CREATE POLICY "clients view own property appointments" ON listing_appointments
  FOR SELECT TO authenticated
  USING (property_id IN (SELECT id FROM properties WHERE client_id = get_my_profile_id()));

-- market_updates
CREATE POLICY "agents full access market_updates" ON market_updates
  FOR ALL TO authenticated USING (get_my_role() = 'agent');

CREATE POLICY "clients can view market updates" ON market_updates
  FOR SELECT TO authenticated USING (true);

-- cmas
CREATE POLICY "agents full access cmas" ON cmas
  FOR ALL TO authenticated USING (get_my_role() = 'agent');

CREATE POLICY "clients view own property cmas" ON cmas
  FOR SELECT TO authenticated
  USING (property_id IN (SELECT id FROM properties WHERE client_id = get_my_profile_id()));

-- property_prep_items
CREATE POLICY "agents full access prep items" ON property_prep_items
  FOR ALL TO authenticated USING (get_my_role() = 'agent');

CREATE POLICY "clients select own prep items" ON property_prep_items
  FOR SELECT TO authenticated
  USING (property_id IN (SELECT id FROM properties WHERE client_id = get_my_profile_id()));

CREATE POLICY "clients update own prep items" ON property_prep_items
  FOR UPDATE TO authenticated
  USING (property_id IN (SELECT id FROM properties WHERE client_id = get_my_profile_id()));

-- property_prep_files
CREATE POLICY "agents full access prep files" ON property_prep_files
  FOR ALL TO authenticated USING (get_my_role() = 'agent');

CREATE POLICY "clients select own prep files" ON property_prep_files
  FOR SELECT TO authenticated
  USING (prep_item_id IN (
    SELECT ppi.id FROM property_prep_items ppi
    JOIN properties p ON p.id = ppi.property_id
    WHERE p.client_id = get_my_profile_id()
  ));

CREATE POLICY "clients insert prep files" ON property_prep_files
  FOR INSERT TO authenticated
  WITH CHECK (
    prep_item_id IN (
      SELECT ppi.id FROM property_prep_items ppi
      JOIN properties p ON p.id = ppi.property_id
      WHERE p.client_id = get_my_profile_id()
    ) AND uploader_id = auth.uid()
  );

-- fintrac_requirements
CREATE POLICY "agents full access fintrac" ON fintrac_requirements
  FOR ALL TO authenticated USING (get_my_role() = 'agent');

CREATE POLICY "clients view own fintrac" ON fintrac_requirements
  FOR SELECT TO authenticated
  USING (property_id IN (SELECT id FROM properties WHERE client_id = get_my_profile_id()));

-- showings
CREATE POLICY "agents full access showings" ON showings
  FOR ALL TO authenticated USING (get_my_role() = 'agent');

CREATE POLICY "clients view own showings" ON showings
  FOR SELECT TO authenticated
  USING (property_id IN (SELECT id FROM properties WHERE client_id = get_my_profile_id()));

-- deal_tasks
CREATE POLICY "agents full access deal tasks" ON deal_tasks
  FOR ALL TO authenticated USING (get_my_role() = 'agent');

CREATE POLICY "clients view own deal tasks" ON deal_tasks
  FOR SELECT TO authenticated
  USING (property_id IN (SELECT id FROM properties WHERE client_id = get_my_profile_id()));

-- deal_task_files
CREATE POLICY "agents full access deal task files" ON deal_task_files
  FOR ALL TO authenticated USING (get_my_role() = 'agent');

CREATE POLICY "clients view own deal task files" ON deal_task_files
  FOR SELECT TO authenticated
  USING (deal_task_id IN (
    SELECT dt.id FROM deal_tasks dt
    JOIN properties p ON p.id = dt.property_id
    WHERE p.client_id = get_my_profile_id()
  ));

-- timeline_events
CREATE POLICY "agents full access timeline" ON timeline_events
  FOR ALL TO authenticated USING (get_my_role() = 'agent');

CREATE POLICY "clients view own timeline" ON timeline_events
  FOR SELECT TO authenticated
  USING (property_id IN (SELECT id FROM properties WHERE client_id = get_my_profile_id()));

-- activity_logs
CREATE POLICY "agents full access activity" ON activity_logs
  FOR ALL TO authenticated USING (get_my_role() = 'agent');

CREATE POLICY "clients view own activity" ON activity_logs
  FOR SELECT TO authenticated
  USING (property_id IN (SELECT id FROM properties WHERE client_id = get_my_profile_id()));

-- Seed default checklist template
INSERT INTO checklist_templates (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Standard Property Prep');

INSERT INTO checklist_template_items (template_id, label, description, is_required, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Survey', 'Current property survey document', true, 1),
  ('00000000-0000-0000-0000-000000000001', 'Site Plan Approval', 'Municipal site plan approval documentation', true, 2),
  ('00000000-0000-0000-0000-000000000001', 'Building Plans', 'Original or as-built building plans', false, 3),
  ('00000000-0000-0000-0000-000000000001', 'Tax Bill', 'Most recent property tax bill', true, 4),
  ('00000000-0000-0000-0000-000000000001', 'Open Permits', 'Any outstanding or open building permits', true, 5),
  ('00000000-0000-0000-0000-000000000001', 'Occupancy Permits', 'Certificate(s) of occupancy', true, 6),
  ('00000000-0000-0000-0000-000000000001', 'Boathouse LUP', 'Lake Use Permit for boathouse if applicable', false, 7),
  ('00000000-0000-0000-0000-000000000001', 'Restrictive Covenants', 'Any restrictive covenants on title', false, 8),
  ('00000000-0000-0000-0000-000000000001', 'Septic Documentation', 'Septic system permit, design, and inspection records', true, 9),
  ('00000000-0000-0000-0000-000000000001', 'WETT Certificate', 'Wood Energy Technology Transfer certificate for fireplace/woodstove', false, 10),
  ('00000000-0000-0000-0000-000000000001', 'Rentals / Utilities / Contracts', 'Any rental agreements, utility contracts, or service contracts', false, 11),
  ('00000000-0000-0000-0000-000000000001', 'Water Potability Test', 'Recent water quality/potability test results', true, 12),
  ('00000000-0000-0000-0000-000000000001', 'Inspection Report', 'Previous home inspection report if available', false, 13),
  ('00000000-0000-0000-0000-000000000001', 'Pre-List Inspection Report', 'Pre-listing home inspection report', false, 14),
  ('00000000-0000-0000-0000-000000000001', 'FINTRAC', 'FINTRAC identification and verification forms', true, 15),
  ('00000000-0000-0000-0000-000000000001', 'RECO Guide', 'RECO consumer information guide acknowledgement', true, 16);
