ALTER TABLE expenses ADD COLUMN IF NOT EXISTS who TEXT NOT NULL DEFAULT 'arthur';
UPDATE expenses SET who = 'arthur' WHERE who IS NULL;
