create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);
alter table public.organizations enable row level security;

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','manager','accountant','maintainer','viewer')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
alter table public.organization_members enable row level security;