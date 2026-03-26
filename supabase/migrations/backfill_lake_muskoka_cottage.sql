-- One-off backfill: seed template items into the Lake Muskoka Cottage property
-- Safe to run multiple times — skips items that already exist (matched by label)

INSERT INTO property_prep_items (property_id, template_item_id, label, description, is_required, status, created_by)
SELECT
  p.id           AS property_id,
  ti.id          AS template_item_id,
  ti.label,
  ti.description,
  ti.is_required,
  'not_started'  AS status,
  'agent'        AS created_by
FROM checklist_template_items ti
CROSS JOIN (
  SELECT id FROM properties WHERE title = 'Lake Muskoka Cottage' LIMIT 1
) p
WHERE ti.template_id = '00000000-0000-0000-0000-000000000001'
  AND NOT EXISTS (
    SELECT 1 FROM property_prep_items existing
    WHERE existing.property_id = p.id
      AND existing.label = ti.label
  )
ORDER BY ti.sort_order;
