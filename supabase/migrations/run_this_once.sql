-- Reset template items
DELETE FROM checklist_template_items
WHERE template_id = '00000000-0000-0000-0000-000000000001';

INSERT INTO checklist_template_items (template_id, label, description, is_required, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Survey',                        'Current property survey document',                                     true,  1),
  ('00000000-0000-0000-0000-000000000001', 'Site Plan Approval',            'Municipal site plan approval documentation',                            false, 2),
  ('00000000-0000-0000-0000-000000000001', 'Building Plans',                'Original or as-built building plans',                                  false, 3),
  ('00000000-0000-0000-0000-000000000001', 'Tax Bill',                      'Most recent property tax bill',                                        true,  4),
  ('00000000-0000-0000-0000-000000000001', 'Open Permits',                  'Any outstanding or open building permits',                             false, 5),
  ('00000000-0000-0000-0000-000000000001', 'Occupancy Permits',             'Certificate(s) of occupancy',                                          false, 6),
  ('00000000-0000-0000-0000-000000000001', 'Boathouse LUP',                 'Lake Use Permit for boathouse if applicable',                          false, 7),
  ('00000000-0000-0000-0000-000000000001', 'Restrictive Covenants',         'Any restrictive covenants registered on title',                        false, 8),
  ('00000000-0000-0000-0000-000000000001', 'Septic Documents',              'Septic system permit, design, and inspection records',                 false, 9),
  ('00000000-0000-0000-0000-000000000001', 'WETT Certificate',              'Wood Energy Technology Transfer certificate for fireplace/woodstove',  false, 10),
  ('00000000-0000-0000-0000-000000000001', 'Rentals / Utilities / Contracts','Any rental agreements, utility contracts, or service contracts',      false, 11),
  ('00000000-0000-0000-0000-000000000001', 'Water Potability Test',         'Recent water quality/potability test results',                         false, 12),
  ('00000000-0000-0000-0000-000000000001', 'Inspection Report',             'Previous home inspection report if available',                         false, 13),
  ('00000000-0000-0000-0000-000000000001', 'Pre-List Inspection Report',    'Pre-listing home inspection (recommended)',                            false, 14);

-- Backfill all existing properties that have no prep items
INSERT INTO property_prep_items (property_id, template_item_id, label, description, is_required, status, created_by)
SELECT
  p.id,
  ti.id,
  ti.label,
  ti.description,
  ti.is_required,
  'not_started',
  'agent'
FROM properties p
CROSS JOIN checklist_template_items ti
WHERE ti.template_id = '00000000-0000-0000-0000-000000000001'
  AND NOT EXISTS (
    SELECT 1 FROM property_prep_items existing
    WHERE existing.property_id = p.id
      AND existing.label = ti.label
  )
ORDER BY p.created_at, ti.sort_order;
