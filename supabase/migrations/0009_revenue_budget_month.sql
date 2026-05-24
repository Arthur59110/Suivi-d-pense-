ALTER TABLE revenues ADD COLUMN IF NOT EXISTS budget_month date;
UPDATE revenues SET budget_month = date_trunc('month', date::date)::date WHERE budget_month IS NULL;
