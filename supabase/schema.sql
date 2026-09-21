-- VEQ backend schema
-- Run this once in Supabase: Project -> SQL Editor -> New query -> paste -> Run.
--
-- Design note: auth is handled by Clerk (not Supabase Auth), so these
-- tables are only ever touched from trusted Next.js server code using the
-- Supabase *service role* key. There is no Row Level Security here because
-- there's no Supabase-side user session to check against — the Clerk
-- session is verified in the Next.js server action before any query runs.
-- Revisit this if VEQ ever needs multiple companies sharing one project.

create extension if not exists "uuid-ossp";

-- One row per person in the workspace. Created automatically the first
-- time someone signs in with Clerk.
create table if not exists employees (
  id uuid primary key default uuid_generate_v4(),
  clerk_user_id text unique not null,
  full_name text,
  email text,
  role text,
  joined_at date default now(),
  left_at date,
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done')),
  ai_generated boolean not null default false,
  created_by uuid references employees(id) on delete set null,
  assigned_to uuid references employees(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists meetings (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  notes text,
  meeting_date timestamptz,
  created_by uuid references employees(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  url text,
  doc_type text,
  created_by uuid references employees(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists videos (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  source_type text not null check (source_type in ('upload', 'youtube_link')),
  url text not null,
  created_by uuid references employees(id) on delete set null,
  created_at timestamptz default now()
);

-- Knowledge base entries: what the Knowledge section shows, and what the
-- AI Guide searches over to answer questions.
create table if not exists knowledge_items (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null,
  created_by uuid references employees(id) on delete set null,
  created_at timestamptz default now()
);

-- Every action VEQ captures, so the AI Guide can answer
-- "what did I do yesterday" style questions later.
create table if not exists activity_log (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) on delete set null,
  action text not null,   -- e.g. 'created_task', 'completed_task', 'logged_meeting'
  ref_table text,         -- which table this activity relates to
  ref_id uuid,            -- the row id in that table
  summary text,           -- human-readable one-liner, shown to the AI Guide
  created_at timestamptz default now()
);

create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_activity_employee on activity_log(employee_id, created_at desc);
