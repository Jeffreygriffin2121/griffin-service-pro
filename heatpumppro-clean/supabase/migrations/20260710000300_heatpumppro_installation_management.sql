-- HeatPump Pro installation management fields
-- Extends the existing public.installations table so installation records can
-- store the full customer and equipment detail set required by the mobile app.

begin;

alter table public.installations
  add column if not exists customer_name text,
  add column if not exists customer_phone text,
  add column if not exists customer_email text,
  add column if not exists site_address text,
  add column if not exists address_line_1 text,
  add column if not exists address_line_2 text,
  add column if not exists town_city text,
  add column if not exists county text,
  add column if not exists eircode text,
  add column if not exists manufacturer_entered text,
  add column if not exists manufacturer text,
  add column if not exists model_family text,
  add column if not exists model text,
  add column if not exists exact_model_number text,
  add column if not exists serial_number text,
  add column if not exists outdoor_model text,
  add column if not exists indoor_model text,
  add column if not exists outdoor_serial text,
  add column if not exists indoor_serial text,
  add column if not exists controller_model text,
  add column if not exists capacity_kw numeric(10,2),
  add column if not exists electrical_phase text,
  add column if not exists voltage text,
  add column if not exists system_type text,
  add column if not exists heat_source text,
  add column if not exists configuration_type text,
  add column if not exists refrigerant text,
  add column if not exists refrigerant_charge_kg numeric(10,2),
  add column if not exists glycol_type text,
  add column if not exists glycol_percentage numeric(10,2),
  add column if not exists design_flow_temperature numeric(10,2),
  add column if not exists maximum_flow_temperature numeric(10,2),
  add column if not exists buffer_tank text,
  add column if not exists buffer_tank_size_litres numeric(10,2),
  add column if not exists cylinder_manufacturer text,
  add column if not exists cylinder_model text,
  add column if not exists cylinder_size_litres numeric(10,2),
  add column if not exists installer text,
  add column if not exists commission_date date,
  add column if not exists installation_date date,
  add column if not exists warranty_expiry date,
  add column if not exists year_introduced integer,
  add column if not exists firmware_version text,
  add column if not exists notes text,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists customer_id uuid references public.customers(id) on delete set null;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_updated_at_installations'
      and tgrelid = 'public.installations'::regclass
  ) then
    create trigger set_updated_at_installations
    before update on public.installations
    for each row execute function public.set_updated_at();
  end if;
end $$;

create index if not exists idx_installations_customer_name on public.installations(customer_name);
create index if not exists idx_installations_customer_phone on public.installations(customer_phone);
create index if not exists idx_installations_manufacturer on public.installations(manufacturer);
create index if not exists idx_installations_model_family on public.installations(model_family);
create index if not exists idx_installations_model on public.installations(model);
create index if not exists idx_installations_exact_model_number on public.installations(exact_model_number);
create index if not exists idx_installations_serial_number on public.installations(serial_number);
create index if not exists idx_installations_installation_date on public.installations(installation_date desc);
create index if not exists idx_installations_commission_date on public.installations(commission_date desc);

commit;