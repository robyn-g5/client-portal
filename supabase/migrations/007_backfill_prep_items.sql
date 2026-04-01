-- Backfill default prep items for properties that have none
INSERT INTO property_prep_items (property_id, template_item_id, label, description, is_required, status, created_by)
SELECT
  p.id AS property_id,
  t.id AS template_item_id,
  t.label,
  t.description,
  t.is_required,
  'empty' AS status,
  'agent' AS created_by
FROM properties p
CROSS JOIN checklist_template_items t
WHERE t.template_id = '00000000-0000-0000-0000-000000000001'
  AND NOT EXISTS (
    SELECT 1 FROM property_prep_items ppi WHERE ppi.property_id = p.id
  )
ORDER BY t.sort_order;
