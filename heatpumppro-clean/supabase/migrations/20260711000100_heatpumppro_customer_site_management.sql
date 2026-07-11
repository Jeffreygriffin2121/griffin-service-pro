-- HeatPump Pro customer and site management
-- Safe additive migration: extends customers, adds sites, and links installations.

begin;

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Customers table extension
-- -----------------------------------------------------------------------------

alter table if exists public.customers
  add column if not exists customer_type text,
  add column if not exists title text,
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists company_name text,
  add column if not exists primary_email text,
  add column if not exists secondary_email text,
  add column if not exists primary_phone text,
  add column if not exists secondary_phone text,
  add column if not exists billing_address_line_1 text,
  add column if not exists billing_address_line_2 text,
  add column if not exists billing_town text,
  add column if not exists billing_county text,
  add column if not exists billing_eircode text,
  add column if not exists notes text,
  add column if not exists preferred_contact_method text,
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists active boolean not null default true,
  add column if not exists created_by uuid references auth.users(id) on delete set null;

-- Keep legacy fields synchronized for backwards compatibility.
update public.customers
set
  first_name = coalesce(nullif(first_name, ''), split_part(coalesce(customer_name, ''), ' ', 1)),
  last_name = coalesce(
    nullif(last_name, ''),
    nullif(trim(replace(coalesce(customer_name, ''), split_part(coalesce(customer_name, ''), ' ', 1), '')), '')
  ),
  primary_email = coalesce(nullif(primary_email, ''), email),
  primary_phone = coalesce(nullif(primary_phone, ''), phone),
  billing_address_line_1 = coalesce(nullif(billing_address_line_1, ''), address),
  billing_eircode = coalesce(nullif(billing_eircode, ''), eircode_postcode),
  customer_type = coalesce(nullif(customer_type, ''), 'domestic')
where true;

alter table if exists public.customers
  alter column customer_type set default 'domestic';

-- Add a safe check constraint if it is not already present.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'customers_customer_type_check'
      and conrelid = 'public.customers'::regclass
  ) then
    alter table public.customers
      add constraint customers_customer_type_check
      check (customer_type in ('domestic', 'commercial', 'landlord', 'property manager', 'other'));
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- Sites table
-- -----------------------------------------------------------------------------

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  site_name text,
  address_line_1 text not null,
  address_line_2 text,
  town text,
  county text,
  eircode text,
  country text not null default 'Ireland',
  access_instructions text,
  parking_notes text,
  gate_code text,
  key_safe_code text,
  property_type text,
  occupancy_type text,
  bedrooms integer,
  floor_area_m2 numeric(10,2),
  construction_year integer,
  insulation_notes text,
  heating_distribution text,
  site_notes text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- -----------------------------------------------------------------------------
-- Installations links to customers and sites
-- -----------------------------------------------------------------------------

alter table if exists public.installations
  add column if not exists customer_id uuid,
  add column if not exists site_id uuid;

-- Ensure customer_id can remain nullable for legacy records.
alter table if exists public.installations
  alter column customer_id drop not null;

-- Add FK constraints only if they do not exist yet.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'installations_customer_id_fkey'
      and conrelid = 'public.installations'::regclass
  ) then
    alter table public.installations
      add constraint installations_customer_id_fkey
      foreign key (customer_id) references public.customers(id) on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'installations_site_id_fkey'
      and conrelid = 'public.installations'::regclass
  ) then
    alter table public.installations
      add constraint installations_site_id_fkey
      foreign key (site_id) references public.sites(id) on delete set null;
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

create index if not exists idx_customers_company_id_active on public.customers(company_id, active);
create index if not exists idx_customers_primary_email on public.customers(primary_email);
create index if not exists idx_customers_primary_phone on public.customers(primary_phone);
create index if not exists idx_customers_billing_eircode on public.customers(billing_eircode);
create index if not exists idx_customers_company_name on public.customers(company_name);
create index if not exists idx_customers_name_parts on public.customers(last_name, first_name);

create index if not exists idx_sites_company_id on public.sites(company_id);
create index if not exists idx_sites_customer_id on public.sites(customer_id);
create index if not exists idx_sites_eircode on public.sites(eircode);
create index if not exists idx_sites_address_line_1 on public.sites(address_line_1);
create index if not exists idx_sites_active on public.sites(active);

create index if not exists idx_installations_site_id on public.installations(site_id);
create index if not exists idx_installations_customer_id on public.installations(customer_id);

-- -----------------------------------------------------------------------------
-- updated_at handling
-- -----------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_updated_at_sites'
      and tgrelid = 'public.sites'::regclass
  ) then
    create trigger set_updated_at_sites
    before update on public.sites
    for each row execute function public.set_updated_at();
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- RLS and policies for sites
-- -----------------------------------------------------------------------------

alter table public.sites enable row level security;
alter table public.sites force row level security;

drop policy if exists sites_select on public.sites;
create policy sites_select
on public.sites
for select
to authenticated
using (public.is_company_member(company_id));

drop policy if exists sites_insert on public.sites;
create policy sites_insert
on public.sites
for insert
to authenticated
with check (public.is_company_member(company_id));

drop policy if exists sites_update on public.sites;
create policy sites_update
on public.sites
for update
to authenticated
using (public.is_company_member(company_id))
with check (public.is_company_member(company_id));

drop policy if exists sites_delete on public.sites;
create policy sites_delete
on public.sites
for delete
to authenticated
using (public.is_company_admin(company_id));

commit;
