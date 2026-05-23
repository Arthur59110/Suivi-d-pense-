-- Restreint l'accès aux 2 emails autorisés
-- À exécuter dans Supabase Studio > SQL Editor

DROP POLICY IF EXISTS "allow_all" ON expenses;

CREATE POLICY "authorized_users_only" ON expenses
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
