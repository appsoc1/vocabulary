-- Create tables for the English SRS App
-- Run this in your Supabase SQL Editor

-- 1. Folders Table
create table public.folders (
  id text primary key,
  owner_id uuid references auth.users(id) not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Cards Table
create table public.cards (
  id text primary key,
  owner_id uuid references auth.users(id) not null,
  folder_id text references public.folders(id) on delete cascade not null,
  type text not null, -- 'word' or 'sentence'
  english text not null,
  meaning_1 text not null,
  meaning_2 text,
  video_url text,
  keyword text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Progress Table
create table public.progress (
  id text primary key,
  owner_id uuid references auth.users(id) not null,
  card_id text references public.cards(id) on delete cascade not null,
  due_at timestamp with time zone not null,
  interval_days float not null,
  ease float not null,
  reps int not null,
  lapses int not null,
  state text not null, -- 'new', 'learning', 'review'
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(card_id)
);

-- Enable Row Level Security (RLS)
alter table public.folders enable row level security;
alter table public.cards enable row level security;
alter table public.progress enable row level security;

-- Create Policies (Users can only see/edit their own data)

-- Folders Policies
create policy "Users can view their own folders" on public.folders
  for select using (auth.uid() = owner_id);

create policy "Users can insert their own folders" on public.folders
  for insert with check (auth.uid() = owner_id);

create policy "Users can delete their own folders" on public.folders
  for delete using (auth.uid() = owner_id);

-- Cards Policies
create policy "Users can view their own cards" on public.cards
  for select using (auth.uid() = owner_id);

create policy "Users can insert their own cards" on public.cards
  for insert with check (auth.uid() = owner_id);

create policy "Users can delete their own cards" on public.cards
  for delete using (auth.uid() = owner_id);

-- Progress Policies
create policy "Users can view their own progress" on public.progress
  for select using (auth.uid() = owner_id);

create policy "Users can insert their own progress" on public.progress
  for insert with check (auth.uid() = owner_id);

create policy "Users can update their own progress" on public.progress
  for update using (auth.uid() = owner_id);
