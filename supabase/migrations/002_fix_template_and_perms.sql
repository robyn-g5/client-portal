-- Allow clients to add new prep items to their own properties
CREATE POLICY "clients insert own prep items" ON property_prep_items
  FOR INSERT TO authenticated
  WITH CHECK (
    property_id IN (SELECT id FROM properties WHERE client_id = get_my_profile_id())
  );

-- Remove FINTRAC and RECO Guide from the template checklist
-- (these are handled separately via fintrac_requirements table and the Required box)
DELETE FROM checklist_template_items
WHERE template_id = '00000000-0000-0000-0000-000000000001'
  AND label IN ('FINTRAC', 'RECO Guide');

-- Clear and reset the template items to match the canonical document list
DELETE FROM checklist_template_items
WHERE template_id = '00000000-0000-0000-0000-000000000001';

INSERT INTO checklist_template_items (template_id, label, description, is_required, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Survey',                       'Current property survey document',                                      true,  1),
  ('00000000-0000-0000-0000-000000000001', 'Site Plan Approval',           'Municipal site plan approval documentation',                             false, 2),
  ('00000000-0000-0000-0000-000000000001', 'Building Plans',               'Original or as-built building plans',                                   false, 3),
  ('00000000-0000-0000-0000-000000000001', 'Tax Bill',                     'Most recent property tax bill',                                         true,  4),
  ('00000000-0000-0000-0000-000000000001', 'Open Permits',                 'Any outstanding or open building permits',                              false, 5),
  ('00000000-0000-0000-0000-000000000001', 'Occupancy Permits',            'Certificate(s) of occupancy',                                           false, 6),
  ('00000000-0000-0000-0000-000000000001', 'Boathouse LUP',                'Lake Use Permit for boathouse if applicable',                           false, 7),
  ('00000000-0000-0000-0000-000000000001', 'Restrictive Covenants',        'Any restrictive covenants registered on title',                         false, 8),
  ('00000000-0000-0000-0000-000000000001', 'Septic Documents',             'Septic system permit, design, and inspection records',                  false, 9),
  ('00000000-0000-0000-0000-000000000001', 'WETT Certificate',             'Wood Energy Technology Transfer certificate for fireplace/woodstove',   false, 10),
  ('00000000-0000-0000-0000-000000000001', 'Rentals / Utilities / Contracts', 'Any rental agreements, utility contracts, or service contracts',     false, 11),
  ('00000000-0000-0000-0000-000000000001', 'Water Potability Test',        'Recent water quality/potability test results',                          false, 12),
  ('00000000-0000-0000-0000-000000000001', 'Inspection Report',            'Previous home inspection report if available',                          false, 13),
  ('00000000-0000-0000-0000-000000000001', 'Pre-List Inspection Report',   'Pre-listing home inspection (recommended)',                             false, 14);
