-- DISABLE RLS for Single-User Mode
-- Run this in Supabase SQL Editor to allow the hardcoded user to access data

-- Remove existing policies
drop policy if exists "Users can view their own folders" on public.folders;
drop policy if exists "Users can insert their own folders" on public.folders;
drop policy if exists "Users can delete their own folders" on public.folders;

drop policy if exists "Users can view their own cards" on public.cards;
drop policy if exists "Users can insert their own cards" on public.cards;
drop policy if exists "Users can delete their own cards" on public.cards;

drop policy if exists "Users can view their own progress" on public.progress;
drop policy if exists "Users can insert their own progress" on public.progress;
drop policy if exists "Users can update their own progress" on public.progress;

-- Disable RLS completely for single-user mode
alter table public.folders disable row level security;
alter table public.cards disable row level security;
alter table public.progress disable row level security;

-- Also need to remove foreign key constraint on owner_id since we're not using auth.users
-- First remove the constraint, then alter the column type to text
alter table public.folders drop constraint if exists folders_owner_id_fkey;
alter table public.cards drop constraint if exists cards_owner_id_fkey;
alter table public.progress drop constraint if exists progress_owner_id_fkey;

-- Change owner_id column type from uuid to text to accept our custom user ID
alter table public.folders alter column owner_id type text using owner_id::text;
alter table public.cards alter column owner_id type text using owner_id::text;
alter table public.progress alter column owner_id type text using owner_id::text;
