-- Suivi de dépenses — schéma initial
-- À exécuter dans Supabase Studio > SQL Editor

CREATE TABLE IF NOT EXISTS expenses (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  amount      NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  description TEXT           NOT NULL,
  category    TEXT           NOT NULL,
  date        DATE           NOT NULL,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
