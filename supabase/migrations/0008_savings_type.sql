ALTER TABLE savings ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'deposit'
  CONSTRAINT savings_type_check CHECK (type IN ('deposit', 'withdrawal'));
