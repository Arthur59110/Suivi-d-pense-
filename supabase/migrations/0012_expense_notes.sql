-- Notes de frais (avances pro de Paloma)
-- Vraiment séparé : pas dans expenses/revenues/analyse. N'impacte QUE le solde du mois.
-- Logique : la note déduit du solde du mois `date`. Si remboursée, elle réinjecte dans le solde du mois `reimbursed_date`.

CREATE TABLE IF NOT EXISTS expense_notes (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  amount          NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  description     TEXT           NOT NULL DEFAULT '',
  who             TEXT           NOT NULL DEFAULT 'paloma',
  date            DATE           NOT NULL,
  reimbursed      BOOLEAN        NOT NULL DEFAULT false,
  reimbursed_date DATE,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT now(),
  CHECK ((reimbursed = false AND reimbursed_date IS NULL) OR (reimbursed = true AND reimbursed_date IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS expense_notes_date_idx ON expense_notes (date);
CREATE INDEX IF NOT EXISTS expense_notes_reimbursed_date_idx ON expense_notes (reimbursed_date);

ALTER TABLE expense_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authorized_users_only_expense_notes" ON expense_notes
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
