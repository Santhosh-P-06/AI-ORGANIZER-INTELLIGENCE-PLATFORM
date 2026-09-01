create extension if not exists pgcrypto;

create table if not exists users (
  id text primary key,
  name text not null,
  email text not null unique,
  role text not null check (role in ('ORGANISER', 'VOLUNTEER', 'STUDENT', 'ADMIN')),
  department text not null,
  phone text,
  student_roll_no text,
  admin_id text,
  is_approved boolean default true,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id text primary key,
  title text not null,
  type text not null,
  description text not null,
  starts_on date not null,
  ends_on date,
  start_time text not null,
  end_time text not null,
  venue text not null,
  status text not null default 'DRAFT',
  organizer_id text references users(id),
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists registrations (
  id text primary key,
  event_id text not null references events(id) on delete cascade,
  student_id text references users(id),
  student_name text not null,
  roll_number text not null,
  email text not null,
  phone text,
  department text,
  team_name text,
  custom_responses jsonb not null default '{}'::jsonb,
  status text not null default 'CONFIRMED',
  attendance jsonb not null default '{}'::jsonb,
  round_tracking jsonb not null default '{}'::jsonb,
  certificate_id text,
  created_at timestamptz not null default now(),
  unique(event_id, roll_number)
);

create table if not exists certificates (
  id text primary key,
  certificate_id text not null unique,
  event_id text not null references events(id) on delete cascade,
  recipient_name text not null,
  recipient_email text not null,
  recipient_role text not null,
  verification_url text not null,
  status text not null default 'GENERATED',
  metadata jsonb not null default '{}'::jsonb,
  issued_at timestamptz not null default now(),
  sent_at timestamptz
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id text,
  actor_name text not null,
  actor_role text not null,
  action text not null,
  details text not null,
  category text not null,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  target_role text,
  event_id text references events(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'INFO',
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

create table if not exists n8n_webhook_events (
  id uuid primary key,
  topic text not null,
  source text not null default 'n8n',
  payload jsonb not null default '{}'::jsonb,
  headers jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists automation_runs (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  event_id text,
  n8n_execution_id text,
  status text not null default 'RECEIVED',
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_registrations_event_id on registrations(event_id);
create index if not exists idx_certificates_event_id on certificates(event_id);
create index if not exists idx_n8n_webhook_events_topic on n8n_webhook_events(topic);
create index if not exists idx_automation_runs_topic on automation_runs(topic);
