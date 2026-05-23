# Suivi de dépenses

Application de suivi de dépenses personnelles — Next.js 15 + Supabase.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4
- Supabase (Postgres)
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

Dans Supabase Studio > SQL Editor, exécutez le fichier :

```
supabase/migrations/0001_initial.sql
```

### 4. Lancer le serveur de développement

```bash
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Catégories disponibles

Alimentation, Transport, Logement, Santé, Loisirs, Vêtements, Éducation, Autre.

## Fonctionnalités

- Tableau de bord : statistiques du mois (total, nombre, moyenne) + graphique en donut + dernières dépenses
- Liste complète des dépenses avec modification et suppression
- Formulaire d'ajout / modification avec validation
