CREATE TABLE IF NOT EXISTS savings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  description text NOT NULL DEFAULT '',
  who text NOT NULL CHECK (who IN ('arthur', 'paloma')),
  date date NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE savings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users" ON savings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
