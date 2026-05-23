# Suivi de dépenses

Application de suivi de dépenses personnelles — Next.js 15 + Supabase. Accès restreint via Supabase Auth (email/password).

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4
- Supabase (Postgres + Auth)
- Recharts (graphiques)
- React Hook Form + Zod

## Mise en route

### 1. Cloner et installer

```bash
git clone https://github.com/Arthur59110/Suivi-d-pense-.git
cd Suivi-d-pense-
pnpm install
```

### 2. Variables d'environnement

```bash
cp .env.local.example .env.local
```

Renseignez `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` depuis votre projet Supabase (Settings > API).

### 3. Base de données

Dans Supabase Studio > SQL Editor, exécutez dans l'ordre :

1. `supabase/migrations/0001_initial.sql` — crée la table `expenses`
2. `supabase/migrations/0002_auth_rls.sql` — restreint l'accès aux 2 emails autorisés

### 4. Créer les utilisateurs autorisés

Dans Supabase Studio :
- **Authentication** > **Providers** > **Email** : désactivez "Confirm email" si vous voulez aller plus vite (sinon il faudra confirmer par mail)
- **Authentication** > **Users** > **Add user** > **Create new user**
- Créez les 2 comptes avec leur email et un mot de passe :
  - `herengarthur@gmail.com`
  - `paloma.kostrzewa13@gmail.com`
- Cochez **Auto Confirm User** pour éviter le mail de confirmation

Pour modifier la liste des emails autorisés, éditez `supabase/migrations/0002_auth_rls.sql` et ré-exécutez-le.

### 5. Lancer le serveur de développement

```bash
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) — vous serez redirigé vers `/login`.

## Catégories disponibles

Alimentation, Transport, Logement, Santé, Loisirs, Vêtements, Éducation, Autre.

## Fonctionnalités

- Authentification email/password (Supabase Auth)
- Tableau de bord : statistiques du mois (total, nombre, moyenne) + graphique en donut + dernières dépenses
- Liste complète des dépenses avec modification et suppression
- Formulaire d'ajout / modification avec validation
- Accès restreint via RLS Postgres : seuls les emails listés dans la policy peuvent lire/écrire
