-- Simplify prep item status to two values: 'empty' and 'complete'

-- Drop the old check constraint first so the data migration can run
ALTER TABLE property_prep_items
  DROP CONSTRAINT IF EXISTS property_prep_items_status_check;

-- Migrate existing data
UPDATE property_prep_items SET status = 'empty' WHERE status IN ('not_started', 'in_progress');
UPDATE property_prep_items SET status = 'complete' WHERE status = 'completed';

-- Add the new constraint
ALTER TABLE property_prep_items
  ADD CONSTRAINT property_prep_items_status_check
  CHECK (status IN ('empty', 'complete'));

ALTER TABLE property_prep_items
  ALTER COLUMN status SET DEFAULT 'empty';
