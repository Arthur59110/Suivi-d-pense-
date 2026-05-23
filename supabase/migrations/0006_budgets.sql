CREATE TABLE IF NOT EXISTS budgets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL UNIQUE,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users" ON budgets
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
