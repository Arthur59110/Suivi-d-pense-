-- Table pour stocker les abonnements push (Web Push API)
-- À exécuter dans Supabase Studio > SQL Editor

create table if not exists push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  who         text not null check (who in ('arthur', 'paloma')),
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz default now()
);

alter table push_subscriptions enable row level security;

drop policy if exists "push_subscriptions auth users full access" on push_subscriptions;
create policy "push_subscriptions auth users full access"
  on push_subscriptions for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
