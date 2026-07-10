-- HeatPump Pro production-ready Supabase schema
-- Compatible with Supabase Postgres

begin;

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Shared helper functions
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  support_email text,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'engineer' check (role in ('owner', 'manager', 'engineer', 'viewer')),
  status text not null default 'active' check (status in ('active', 'inactive', 'invited')),
  invited_at timestamptz,
  joined_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (company_id, user_id)
);

create table if not exists public.engineer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  full_name text not null,
  phone text,
  certification_level text,
  timezone text default 'UTC',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_name text not null,
  phone text,
  email text,
  address text,
  eircode_postcode text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.installations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  installation_code text,
  manufacturer text not null,
  model text not null,
  serial_number text not null,
  installation_date date,
  status text not null default 'active' check (status in ('commissioned', 'active', 'out-of-service', 'under-warranty')),
  address text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.equipment_passports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  installation_id uuid not null unique references public.installations(id) on delete cascade,
  indoor_unit_serial text,
  outdoor_unit_serial text,
  refrigerant_type text,
  refrigerant_charge text,
  system_capacity text,
  health_score integer check (health_score between 0 and 100),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.service_visits (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  installation_id uuid not null references public.installations(id) on delete cascade,
  engineer_profile_id uuid references public.engineer_profiles(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'in-progress', 'completed', 'cancelled')),
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,
  summary text,
  customer_recommendations text,
  customer_signature_name text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  installation_id uuid not null references public.installations(id) on delete cascade,
  service_visit_id uuid references public.service_visits(id) on delete set null,
  metric_name text not null,
  value_numeric numeric,
  value_text text,
  unit text,
  captured_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.fault_records (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  installation_id uuid not null references public.installations(id) on delete cascade,
  service_visit_id uuid references public.service_visits(id) on delete set null,
  fault_code text,
  symptoms text,
  summary text not null,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  status text not null default 'open' check (status in ('open', 'monitoring', 'resolved')),
  detected_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.verified_fixes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  installation_id uuid not null references public.installations(id) on delete cascade,
  service_visit_id uuid references public.service_visits(id) on delete set null,
  fault_record_id uuid references public.fault_records(id) on delete set null,
  fault_code text,
  symptoms text,
  root_cause text not null,
  actions_taken text not null,
  parts_used text[] not null default '{}',
  tools_used text[] not null default '{}',
  estimated_repair_time_minutes integer,
  diagnostic_steps_completed text[] not null default '{}',
  safety_warnings_reviewed text[] not null default '{}',
  result text not null default 'verified-fixed' check (result in ('verified-fixed', 'monitor')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.part_replacements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  installation_id uuid not null references public.installations(id) on delete cascade,
  service_visit_id uuid references public.service_visits(id) on delete set null,
  verified_fix_id uuid references public.verified_fixes(id) on delete set null,
  part_name text not null,
  part_number text,
  quantity integer not null default 1 check (quantity > 0),
  status text not null default 'installed' check (status in ('pending', 'installed', 'backordered')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.engineer_notes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  installation_id uuid not null references public.installations(id) on delete cascade,
  service_visit_id uuid references public.service_visits(id) on delete set null,
  note text not null,
  is_private boolean not null default true,
  include_in_customer_report boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.photo_records (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  installation_id uuid not null references public.installations(id) on delete cascade,
  service_visit_id uuid references public.service_visits(id) on delete set null,
  local_uri text,
  remote_storage_path text,
  bucket_name text not null default 'photo-records',
  object_path text,
  upload_status text not null default 'local' check (upload_status in ('local', 'syncing', 'synced', 'failed')),
  caption text,
  category text not null default 'other' check (category in ('before', 'after', 'equipment', 'issue', 'other')),
  include_in_report boolean not null default true,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.document_records (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  installation_id uuid not null references public.installations(id) on delete cascade,
  service_visit_id uuid references public.service_visits(id) on delete set null,
  title text not null,
  document_type text not null default 'service' check (document_type in ('service', 'commissioning', 'warranty', 'manual', 'other')),
  local_uri text,
  remote_storage_path text,
  bucket_name text not null default 'document-records',
  object_path text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.report_records (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  installation_id uuid not null references public.installations(id) on delete cascade,
  service_visit_id uuid references public.service_visits(id) on delete set null,
  report_type text not null check (report_type in ('service', 'commissioning', 'diagnostic', 'customer')),
  uri text,
  summary text,
  status text not null default 'draft' check (status in ('draft', 'final', 'issued')),
  generated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.warranty_records (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  installation_id uuid not null references public.installations(id) on delete cascade,
  provider text not null,
  policy_number text,
  warranty_start date not null,
  warranty_expiry date not null,
  status text not null default 'active' check (status in ('active', 'expired', 'void')),
  terms text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_diagnostic_records (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  installation_id uuid not null references public.installations(id) on delete cascade,
  service_visit_id uuid references public.service_visits(id) on delete set null,
  fault_code text,
  symptoms text,
  probable_cause_summary text,
  workflow_summary text,
  confidence_score integer check (confidence_score between 0 and 100),
  estimated_repair_time_minutes integer,
  recommended_parts jsonb not null default '[]'::jsonb,
  recommended_tools jsonb not null default '[]'::jsonb,
  model_name text,
  prompt_version text,
  raw_payload jsonb,
  generated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

create index if not exists idx_company_members_company_id on public.company_members(company_id);
create index if not exists idx_company_members_user_id on public.company_members(user_id);
create index if not exists idx_company_members_role_status on public.company_members(company_id, role, status);

create index if not exists idx_engineer_profiles_company_id on public.engineer_profiles(company_id);
create index if not exists idx_engineer_profiles_user_id on public.engineer_profiles(user_id);

create index if not exists idx_customers_company_id on public.customers(company_id);
create index if not exists idx_customers_name on public.customers(customer_name);

create index if not exists idx_installations_company_id on public.installations(company_id);
create index if not exists idx_installations_customer_id on public.installations(customer_id);
create index if not exists idx_installations_serial_number on public.installations(serial_number);
create index if not exists idx_installations_status on public.installations(status);

create index if not exists idx_equipment_passports_company_id on public.equipment_passports(company_id);
create index if not exists idx_equipment_passports_installation_id on public.equipment_passports(installation_id);

create index if not exists idx_service_visits_company_id on public.service_visits(company_id);
create index if not exists idx_service_visits_installation_id on public.service_visits(installation_id);
create index if not exists idx_service_visits_engineer_profile_id on public.service_visits(engineer_profile_id);
create index if not exists idx_service_visits_status_started_at on public.service_visits(status, started_at desc);

create index if not exists idx_measurements_company_id on public.measurements(company_id);
create index if not exists idx_measurements_installation_id on public.measurements(installation_id);
create index if not exists idx_measurements_service_visit_id on public.measurements(service_visit_id);
create index if not exists idx_measurements_metric_name on public.measurements(metric_name);
create index if not exists idx_measurements_captured_at on public.measurements(captured_at desc);

create index if not exists idx_fault_records_company_id on public.fault_records(company_id);
create index if not exists idx_fault_records_installation_id on public.fault_records(installation_id);
create index if not exists idx_fault_records_service_visit_id on public.fault_records(service_visit_id);
create index if not exists idx_fault_records_fault_code on public.fault_records(fault_code);
create index if not exists idx_fault_records_status on public.fault_records(status);

create index if not exists idx_verified_fixes_company_id on public.verified_fixes(company_id);
create index if not exists idx_verified_fixes_installation_id on public.verified_fixes(installation_id);
create index if not exists idx_verified_fixes_service_visit_id on public.verified_fixes(service_visit_id);
create index if not exists idx_verified_fixes_fault_record_id on public.verified_fixes(fault_record_id);
create index if not exists idx_verified_fixes_fault_code on public.verified_fixes(fault_code);

create index if not exists idx_part_replacements_company_id on public.part_replacements(company_id);
create index if not exists idx_part_replacements_installation_id on public.part_replacements(installation_id);
create index if not exists idx_part_replacements_service_visit_id on public.part_replacements(service_visit_id);
create index if not exists idx_part_replacements_verified_fix_id on public.part_replacements(verified_fix_id);
create index if not exists idx_part_replacements_part_name on public.part_replacements(part_name);

create index if not exists idx_engineer_notes_company_id on public.engineer_notes(company_id);
create index if not exists idx_engineer_notes_installation_id on public.engineer_notes(installation_id);
create index if not exists idx_engineer_notes_service_visit_id on public.engineer_notes(service_visit_id);
create index if not exists idx_engineer_notes_created_by on public.engineer_notes(created_by);
create index if not exists idx_engineer_notes_privacy on public.engineer_notes(company_id, is_private);

create index if not exists idx_photo_records_company_id on public.photo_records(company_id);
create index if not exists idx_photo_records_installation_id on public.photo_records(installation_id);
create index if not exists idx_photo_records_service_visit_id on public.photo_records(service_visit_id);
create index if not exists idx_photo_records_upload_status on public.photo_records(upload_status);
create index if not exists idx_photo_records_bucket_path on public.photo_records(bucket_name, object_path);

create index if not exists idx_document_records_company_id on public.document_records(company_id);
create index if not exists idx_document_records_installation_id on public.document_records(installation_id);
create index if not exists idx_document_records_service_visit_id on public.document_records(service_visit_id);
create index if not exists idx_document_records_bucket_path on public.document_records(bucket_name, object_path);
create index if not exists idx_document_records_status on public.document_records(status);

create index if not exists idx_report_records_company_id on public.report_records(company_id);
create index if not exists idx_report_records_installation_id on public.report_records(installation_id);
create index if not exists idx_report_records_service_visit_id on public.report_records(service_visit_id);
create index if not exists idx_report_records_type_status on public.report_records(report_type, status);

create index if not exists idx_warranty_records_company_id on public.warranty_records(company_id);
create index if not exists idx_warranty_records_installation_id on public.warranty_records(installation_id);
create index if not exists idx_warranty_records_expiry on public.warranty_records(warranty_expiry);
create index if not exists idx_warranty_records_status on public.warranty_records(status);

create index if not exists idx_ai_diagnostic_records_company_id on public.ai_diagnostic_records(company_id);
create index if not exists idx_ai_diagnostic_records_installation_id on public.ai_diagnostic_records(installation_id);
create index if not exists idx_ai_diagnostic_records_service_visit_id on public.ai_diagnostic_records(service_visit_id);
create index if not exists idx_ai_diagnostic_records_fault_code on public.ai_diagnostic_records(fault_code);
create index if not exists idx_ai_diagnostic_records_created_at on public.ai_diagnostic_records(created_at desc);

-- -----------------------------------------------------------------------------
-- Company membership helper functions (created after company_members table)
-- -----------------------------------------------------------------------------

create or replace function public.current_company_ids()
returns table (company_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select cm.company_id
  from public.company_members cm
  where cm.user_id = auth.uid()
    and cm.status = 'active';
$$;

create or replace function public.is_company_member(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = p_company_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
  );
$$;

create or replace function public.is_company_admin(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = p_company_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
      and cm.role in ('owner', 'manager')
  );
$$;

create or replace function public.has_engineer_access(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.company_members cm
    where cm.company_id = p_company_id
      and cm.user_id = auth.uid()
      and cm.status = 'active'
      and cm.role in ('owner', 'manager', 'engineer')
  );
$$;

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------

drop trigger if exists set_updated_at_companies on public.companies;
create trigger set_updated_at_companies
before update on public.companies
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_company_members on public.company_members;
create trigger set_updated_at_company_members
before update on public.company_members
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_engineer_profiles on public.engineer_profiles;
create trigger set_updated_at_engineer_profiles
before update on public.engineer_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_customers on public.customers;
create trigger set_updated_at_customers
before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_installations on public.installations;
create trigger set_updated_at_installations
before update on public.installations
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_equipment_passports on public.equipment_passports;
create trigger set_updated_at_equipment_passports
before update on public.equipment_passports
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_service_visits on public.service_visits;
create trigger set_updated_at_service_visits
before update on public.service_visits
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_measurements on public.measurements;
create trigger set_updated_at_measurements
before update on public.measurements
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_fault_records on public.fault_records;
create trigger set_updated_at_fault_records
before update on public.fault_records
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_verified_fixes on public.verified_fixes;
create trigger set_updated_at_verified_fixes
before update on public.verified_fixes
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_part_replacements on public.part_replacements;
create trigger set_updated_at_part_replacements
before update on public.part_replacements
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_engineer_notes on public.engineer_notes;
create trigger set_updated_at_engineer_notes
before update on public.engineer_notes
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_photo_records on public.photo_records;
create trigger set_updated_at_photo_records
before update on public.photo_records
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_document_records on public.document_records;
create trigger set_updated_at_document_records
before update on public.document_records
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_report_records on public.report_records;
create trigger set_updated_at_report_records
before update on public.report_records
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_warranty_records on public.warranty_records;
create trigger set_updated_at_warranty_records
before update on public.warranty_records
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_ai_diagnostic_records on public.ai_diagnostic_records;
create trigger set_updated_at_ai_diagnostic_records
before update on public.ai_diagnostic_records
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.engineer_profiles enable row level security;
alter table public.customers enable row level security;
alter table public.installations enable row level security;
alter table public.equipment_passports enable row level security;
alter table public.service_visits enable row level security;
alter table public.measurements enable row level security;
alter table public.fault_records enable row level security;
alter table public.verified_fixes enable row level security;
alter table public.part_replacements enable row level security;
alter table public.engineer_notes enable row level security;
alter table public.photo_records enable row level security;
alter table public.document_records enable row level security;
alter table public.report_records enable row level security;
alter table public.warranty_records enable row level security;
alter table public.ai_diagnostic_records enable row level security;

alter table public.companies force row level security;
alter table public.company_members force row level security;
alter table public.engineer_profiles force row level security;
alter table public.customers force row level security;
alter table public.installations force row level security;
alter table public.equipment_passports force row level security;
alter table public.service_visits force row level security;
alter table public.measurements force row level security;
alter table public.fault_records force row level security;
alter table public.verified_fixes force row level security;
alter table public.part_replacements force row level security;
alter table public.engineer_notes force row level security;
alter table public.photo_records force row level security;
alter table public.document_records force row level security;
alter table public.report_records force row level security;
alter table public.warranty_records force row level security;
alter table public.ai_diagnostic_records force row level security;

-- Companies policies

drop policy if exists companies_select on public.companies;
create policy companies_select
on public.companies
for select
to authenticated
using (public.is_company_member(id));

drop policy if exists companies_insert on public.companies;
create policy companies_insert
on public.companies
for insert
to authenticated
with check (auth.uid() = created_by);

drop policy if exists companies_update on public.companies;
create policy companies_update
on public.companies
for update
to authenticated
using (public.is_company_admin(id))
with check (public.is_company_admin(id));

drop policy if exists companies_delete on public.companies;
create policy companies_delete
on public.companies
for delete
to authenticated
using (public.is_company_admin(id));

-- Company members policies

drop policy if exists company_members_select on public.company_members;
create policy company_members_select
on public.company_members
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists company_members_insert on public.company_members;
create policy company_members_insert
on public.company_members
for insert
to authenticated
with check (public.is_company_admin(company_id));

drop policy if exists company_members_update on public.company_members;
create policy company_members_update
on public.company_members
for update
to authenticated
using (public.is_company_admin(company_id))
with check (public.is_company_admin(company_id));

drop policy if exists company_members_delete on public.company_members;
create policy company_members_delete
on public.company_members
for delete
to authenticated
using (public.is_company_admin(company_id));

-- Generic company-scoped policies

-- engineer_profiles
drop policy if exists engineer_profiles_select on public.engineer_profiles;
create policy engineer_profiles_select
on public.engineer_profiles
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists engineer_profiles_insert on public.engineer_profiles;
create policy engineer_profiles_insert
on public.engineer_profiles
for insert
to authenticated
with check (public.is_company_member(company_id));

drop policy if exists engineer_profiles_update on public.engineer_profiles;
create policy engineer_profiles_update
on public.engineer_profiles
for update
to authenticated
using (public.is_company_member(company_id))
with check (public.is_company_member(company_id));

drop policy if exists engineer_profiles_delete on public.engineer_profiles;
create policy engineer_profiles_delete
on public.engineer_profiles
for delete
to authenticated
using (public.is_company_admin(company_id));

-- customers
drop policy if exists customers_select on public.customers;
create policy customers_select
on public.customers
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists customers_insert on public.customers;
create policy customers_insert
on public.customers
for insert
to authenticated
with check (public.is_company_member(company_id));

drop policy if exists customers_update on public.customers;
create policy customers_update
on public.customers
for update
to authenticated
using (public.is_company_member(company_id))
with check (public.is_company_member(company_id));

drop policy if exists customers_delete on public.customers;
create policy customers_delete
on public.customers
for delete
to authenticated
using (public.is_company_admin(company_id));

-- installations
drop policy if exists installations_select on public.installations;
create policy installations_select
on public.installations
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists installations_insert on public.installations;
create policy installations_insert
on public.installations
for insert
to authenticated
with check (public.is_company_member(company_id));

drop policy if exists installations_update on public.installations;
create policy installations_update
on public.installations
for update
to authenticated
using (public.is_company_member(company_id))
with check (public.is_company_member(company_id));

drop policy if exists installations_delete on public.installations;
create policy installations_delete
on public.installations
for delete
to authenticated
using (public.is_company_admin(company_id));

-- equipment_passports
drop policy if exists equipment_passports_select on public.equipment_passports;
create policy equipment_passports_select
on public.equipment_passports
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists equipment_passports_insert on public.equipment_passports;
create policy equipment_passports_insert
on public.equipment_passports
for insert
to authenticated
with check (public.is_company_member(company_id));

drop policy if exists equipment_passports_update on public.equipment_passports;
create policy equipment_passports_update
on public.equipment_passports
for update
to authenticated
using (public.is_company_member(company_id))
with check (public.is_company_member(company_id));

drop policy if exists equipment_passports_delete on public.equipment_passports;
create policy equipment_passports_delete
on public.equipment_passports
for delete
to authenticated
using (public.is_company_admin(company_id));

-- service_visits
drop policy if exists service_visits_select on public.service_visits;
create policy service_visits_select
on public.service_visits
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists service_visits_insert on public.service_visits;
create policy service_visits_insert
on public.service_visits
for insert
to authenticated
with check (public.has_engineer_access(company_id));

drop policy if exists service_visits_update on public.service_visits;
create policy service_visits_update
on public.service_visits
for update
to authenticated
using (public.has_engineer_access(company_id))
with check (public.has_engineer_access(company_id));

drop policy if exists service_visits_delete on public.service_visits;
create policy service_visits_delete
on public.service_visits
for delete
to authenticated
using (public.is_company_admin(company_id));

-- measurements
drop policy if exists measurements_select on public.measurements;
create policy measurements_select
on public.measurements
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists measurements_insert on public.measurements;
create policy measurements_insert
on public.measurements
for insert
to authenticated
with check (public.has_engineer_access(company_id));

drop policy if exists measurements_update on public.measurements;
create policy measurements_update
on public.measurements
for update
to authenticated
using (public.has_engineer_access(company_id))
with check (public.has_engineer_access(company_id));

drop policy if exists measurements_delete on public.measurements;
create policy measurements_delete
on public.measurements
for delete
to authenticated
using (public.is_company_admin(company_id));

-- fault_records
drop policy if exists fault_records_select on public.fault_records;
create policy fault_records_select
on public.fault_records
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists fault_records_insert on public.fault_records;
create policy fault_records_insert
on public.fault_records
for insert
to authenticated
with check (public.has_engineer_access(company_id));

drop policy if exists fault_records_update on public.fault_records;
create policy fault_records_update
on public.fault_records
for update
to authenticated
using (public.has_engineer_access(company_id))
with check (public.has_engineer_access(company_id));

drop policy if exists fault_records_delete on public.fault_records;
create policy fault_records_delete
on public.fault_records
for delete
to authenticated
using (public.is_company_admin(company_id));

-- verified_fixes
drop policy if exists verified_fixes_select on public.verified_fixes;
create policy verified_fixes_select
on public.verified_fixes
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists verified_fixes_insert on public.verified_fixes;
create policy verified_fixes_insert
on public.verified_fixes
for insert
to authenticated
with check (public.has_engineer_access(company_id));

drop policy if exists verified_fixes_update on public.verified_fixes;
create policy verified_fixes_update
on public.verified_fixes
for update
to authenticated
using (public.has_engineer_access(company_id))
with check (public.has_engineer_access(company_id));

drop policy if exists verified_fixes_delete on public.verified_fixes;
create policy verified_fixes_delete
on public.verified_fixes
for delete
to authenticated
using (public.is_company_admin(company_id));

-- part_replacements
drop policy if exists part_replacements_select on public.part_replacements;
create policy part_replacements_select
on public.part_replacements
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists part_replacements_insert on public.part_replacements;
create policy part_replacements_insert
on public.part_replacements
for insert
to authenticated
with check (public.has_engineer_access(company_id));

drop policy if exists part_replacements_update on public.part_replacements;
create policy part_replacements_update
on public.part_replacements
for update
to authenticated
using (public.has_engineer_access(company_id))
with check (public.has_engineer_access(company_id));

drop policy if exists part_replacements_delete on public.part_replacements;
create policy part_replacements_delete
on public.part_replacements
for delete
to authenticated
using (public.is_company_admin(company_id));

-- engineer_notes
drop policy if exists engineer_notes_select on public.engineer_notes;
create policy engineer_notes_select
on public.engineer_notes
for select
to authenticated
using (
  public.is_company_member(company_id)
  and (
    is_private = false
    or public.has_engineer_access(company_id)
  )
);

drop policy if exists engineer_notes_insert on public.engineer_notes;
create policy engineer_notes_insert
on public.engineer_notes
for insert
to authenticated
with check (public.has_engineer_access(company_id));

drop policy if exists engineer_notes_update on public.engineer_notes;
create policy engineer_notes_update
on public.engineer_notes
for update
to authenticated
using (public.has_engineer_access(company_id))
with check (public.has_engineer_access(company_id));

drop policy if exists engineer_notes_delete on public.engineer_notes;
create policy engineer_notes_delete
on public.engineer_notes
for delete
to authenticated
using (public.is_company_admin(company_id));

-- photo_records
drop policy if exists photo_records_select on public.photo_records;
create policy photo_records_select
on public.photo_records
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists photo_records_insert on public.photo_records;
create policy photo_records_insert
on public.photo_records
for insert
to authenticated
with check (public.has_engineer_access(company_id));

drop policy if exists photo_records_update on public.photo_records;
create policy photo_records_update
on public.photo_records
for update
to authenticated
using (public.has_engineer_access(company_id))
with check (public.has_engineer_access(company_id));

drop policy if exists photo_records_delete on public.photo_records;
create policy photo_records_delete
on public.photo_records
for delete
to authenticated
using (public.is_company_admin(company_id));

-- document_records
drop policy if exists document_records_select on public.document_records;
create policy document_records_select
on public.document_records
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists document_records_insert on public.document_records;
create policy document_records_insert
on public.document_records
for insert
to authenticated
with check (public.has_engineer_access(company_id));

drop policy if exists document_records_update on public.document_records;
create policy document_records_update
on public.document_records
for update
to authenticated
using (public.has_engineer_access(company_id))
with check (public.has_engineer_access(company_id));

drop policy if exists document_records_delete on public.document_records;
create policy document_records_delete
on public.document_records
for delete
to authenticated
using (public.is_company_admin(company_id));

-- report_records
drop policy if exists report_records_select on public.report_records;
create policy report_records_select
on public.report_records
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists report_records_insert on public.report_records;
create policy report_records_insert
on public.report_records
for insert
to authenticated
with check (public.has_engineer_access(company_id));

drop policy if exists report_records_update on public.report_records;
create policy report_records_update
on public.report_records
for update
to authenticated
using (public.has_engineer_access(company_id))
with check (public.has_engineer_access(company_id));

drop policy if exists report_records_delete on public.report_records;
create policy report_records_delete
on public.report_records
for delete
to authenticated
using (public.is_company_admin(company_id));

-- warranty_records
drop policy if exists warranty_records_select on public.warranty_records;
create policy warranty_records_select
on public.warranty_records
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists warranty_records_insert on public.warranty_records;
create policy warranty_records_insert
on public.warranty_records
for insert
to authenticated
with check (public.has_engineer_access(company_id));

drop policy if exists warranty_records_update on public.warranty_records;
create policy warranty_records_update
on public.warranty_records
for update
to authenticated
using (public.has_engineer_access(company_id))
with check (public.has_engineer_access(company_id));

drop policy if exists warranty_records_delete on public.warranty_records;
create policy warranty_records_delete
on public.warranty_records
for delete
to authenticated
using (public.is_company_admin(company_id));

-- ai_diagnostic_records
drop policy if exists ai_diagnostic_records_select on public.ai_diagnostic_records;
create policy ai_diagnostic_records_select
on public.ai_diagnostic_records
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists ai_diagnostic_records_insert on public.ai_diagnostic_records;
create policy ai_diagnostic_records_insert
on public.ai_diagnostic_records
for insert
to authenticated
with check (public.has_engineer_access(company_id));

drop policy if exists ai_diagnostic_records_update on public.ai_diagnostic_records;
create policy ai_diagnostic_records_update
on public.ai_diagnostic_records
for update
to authenticated
using (public.has_engineer_access(company_id))
with check (public.has_engineer_access(company_id));

drop policy if exists ai_diagnostic_records_delete on public.ai_diagnostic_records;
create policy ai_diagnostic_records_delete
on public.ai_diagnostic_records
for delete
to authenticated
using (public.is_company_admin(company_id));

commit;
