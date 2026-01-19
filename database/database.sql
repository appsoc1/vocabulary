-- Enable uuid generator
create extension if not exists pgcrypto;

-- FOLDERS
create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists folders_owner_id_idx on public.folders(owner_id);

-- CARDS
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  folder_id uuid not null references public.folders(id) on delete cascade,

  type text not null check (type in ('word', 'sentence')),
  english text not null,
  meaning_1 text not null,
  meaning_2 text,
  video_url text,
  keyword text, -- nullable; required for sentence at app-level

  created_at timestamptz not null default now()
);

create index if not exists cards_owner_id_idx on public.cards(owner_id);
create index if not exists cards_folder_id_idx on public.cards(folder_id);

-- PROGRESS (SRS state per card)
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  card_id uuid not null references public.cards(id) on delete cascade,

  due_at timestamptz not null default now(),
  interval_days double precision not null default 0,
  ease double precision not null default 2.3,
  reps int not null default 0,
  lapses int not null default 0,
  state text not null default 'new' check (state in ('new', 'learning', 'review')),

  updated_at timestamptz not null default now(),
  unique(owner_id, card_id)
);

create index if not exists progress_owner_id_due_at_idx on public.progress(owner_id, due_at);

-- Auto update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_progress_updated_at on public.progress;
create trigger trg_progress_updated_at
before update on public.progress
for each row execute function public.set_updated_at();
