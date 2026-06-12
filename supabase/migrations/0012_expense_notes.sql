-- Notes de frais (avances pro)
-- Séparé des dépenses/revenus/analyse — impact uniquement sur le solde du mois.
-- type 'advance'      : Paloma avance, remboursement ultérieur attendu
-- type 'reimbursement': remboursement direct reçu (sans avance préalable dans le système)

CREATE TABLE IF NOT EXISTS expense_notes (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  amount          NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  description     TEXT           NOT NULL DEFAULT '',
  who             TEXT           NOT NULL DEFAULT 'paloma',
  type            TEXT           NOT NULL DEFAULT 'advance' CHECK (type IN ('advance', 'reimbursement')),
  date            DATE           NOT NULL,
  reimbursed      BOOLEAN        NOT NULL DEFAULT false,
  reimbursed_date DATE,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT now(),
  CHECK ((reimbursed = false AND reimbursed_date IS NULL) OR (reimbursed = true AND reimbursed_date IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS expense_notes_date_idx          ON expense_notes (date);
CREATE INDEX IF NOT EXISTS expense_notes_reimbursed_date_idx ON expense_notes (reimbursed_date);
CREATE INDEX IF NOT EXISTS expense_notes_type_idx          ON expense_notes (type);

ALTER TABLE expense_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authorized_users_only_expense_notes" ON expense_notes
  FOR ALL TO authenticated
  USING  (auth.jwt() ->> 'email' IN ('herengarthur@gmail.com', 'paloma.kostrzewa13@gmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('herengarthur@gmail.com', 'paloma.kostrzewa13@gmail.com'));
