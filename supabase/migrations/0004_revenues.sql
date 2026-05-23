CREATE TABLE IF NOT EXISTS revenues (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  amount      NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  description TEXT           NOT NULL DEFAULT '',
  source      TEXT           NOT NULL,
  who         TEXT           NOT NULL DEFAULT 'arthur',
  date        DATE           NOT NULL,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT now()
);

ALTER TABLE revenues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authorized_users_only_revenues" ON revenues
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN (
      'herengarthur@gmail.com',
      'paloma.kostrzewa13@gmail.com'
    )
  )
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      'herengarthur@gmail.com',
      'paloma.kostrzewa13@gmail.com'
    )
  );
