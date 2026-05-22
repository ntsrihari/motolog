-- MotoLog initial database schema
-- All tables have RLS enabled

create extension if not exists "uuid-ossp";

-- Profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  phone text,
  email text,
  name text,
  avatar_url text,
  detected_level smallint not null default 1 check (detected_level in (1, 2, 3)),
  city text not null default 'Mumbai',
  theme text not null default 'dark',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Vehicles
create table vehicles (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  registration_number text not null,
  make text not null,
  model text not null,
  year smallint not null,
  fuel_type text not null check (fuel_type in ('petrol', 'diesel', 'cng', 'electric', 'hybrid')),
  vehicle_type text not null check (vehicle_type in ('car', 'bike', 'scooter', 'suv', 'truck')),
  nickname text,
  color_hex text,
  avatar_url text,
  purchase_date date,
  purchase_price_inr integer,
  current_odometer integer not null default 0,
  usage_role text not null default 'daily_commute' check (usage_role in ('daily_commute', 'weekend', 'occasional', 'track')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vehicles_owner_idx on vehicles(owner_id);

-- Vehicle baselines
create table vehicle_baselines (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references vehicles(id) on delete cascade unique,
  odometer_km integer not null,
  last_service_date date,
  last_service_items text[] not null default '{}',
  has_major_mods boolean not null default false,
  primary_usage text not null default 'daily_commute',
  insurance_confirmed boolean not null default false,
  puc_confirmed boolean not null default false,
  is_estimated boolean not null default true,
  created_at timestamptz not null default now()
);

-- Vehicle specs (user overrides on top of reference data)
create table vehicle_specs (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references vehicles(id) on delete cascade unique,
  displacement integer,
  power_bhp numeric(6,2),
  torque_nm numeric(6,2),
  kerb_weight_kg integer,
  tank_capacity_l numeric(5,1),
  tyres_front text,
  tyres_rear text,
  service_interval_km integer,
  service_interval_months smallint,
  oil_grade text,
  source text,
  user_overridden boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Vehicle documents
create table vehicle_documents (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references vehicles(id) on delete cascade unique,
  insurance_provider text,
  insurance_policy_number text,
  insurance_expiry date,
  insurance_premium_inr integer,
  puc_expiry date,
  rc_expiry date,
  warranty_expiry date,
  extended_warranty_expiry date,
  updated_at timestamptz not null default now()
);

-- Logs (polymorphic via log_type + JSONB data)
create table logs (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  log_type text not null check (log_type in ('service', 'fuel', 'accident', 'modification', 'document', 'expense', 'track_session')),
  date date not null,
  odometer_km integer,
  notes text,
  cost_inr integer,
  attachments text[] default '{}',
  data jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index logs_vehicle_idx on logs(vehicle_id);
create index logs_date_idx on logs(vehicle_id, date desc);
create index logs_type_idx on logs(vehicle_id, log_type);

-- Diary entries
create table diary_entries (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  odometer_start integer,
  odometer_end integer,
  odometer_current integer,
  fuel_litres numeric(6,2),
  fuel_cost_per_litre numeric(6,2),
  fuel_total_inr integer,
  drive_feel_note text,
  has_warning_light boolean not null default false,
  warning_light_desc text,
  condition_tags text[] default '{}',
  is_promoted_to_log boolean not null default false,
  promoted_log_id uuid references logs(id),
  created_at timestamptz not null default now(),
  unique(vehicle_id, user_id, date)
);

create index diary_vehicle_idx on diary_entries(vehicle_id, date desc);
create index diary_user_idx on diary_entries(user_id, date desc);

-- Family sharing
create table vehicle_shares (
  id uuid primary key default uuid_generate_v4(),
  vehicle_id uuid not null references vehicles(id) on delete cascade,
  shared_with_user_id uuid not null references profiles(id) on delete cascade,
  permission text not null check (permission in ('view', 'edit')),
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique(vehicle_id, shared_with_user_id)
);

-- RLS Policies

alter table profiles enable row level security;
alter table vehicles enable row level security;
alter table vehicle_baselines enable row level security;
alter table vehicle_specs enable row level security;
alter table vehicle_documents enable row level security;
alter table logs enable row level security;
alter table diary_entries enable row level security;
alter table vehicle_shares enable row level security;

-- Profiles: users can only see/edit their own
create policy "profiles_self" on profiles for all using (auth.uid() = id);

-- Vehicles: owner + shared users can select; only owner can insert/update/delete
create policy "vehicles_owner" on vehicles for all using (auth.uid() = owner_id);
create policy "vehicles_shared_select" on vehicles for select using (
  exists (select 1 from vehicle_shares vs where vs.vehicle_id = id and vs.shared_with_user_id = auth.uid() and vs.accepted_at is not null)
);

-- Baselines/specs/docs: follow vehicle owner
create policy "vehicle_baselines_owner" on vehicle_baselines for all
  using (exists (select 1 from vehicles v where v.id = vehicle_id and v.owner_id = auth.uid()));

create policy "vehicle_specs_owner" on vehicle_specs for all
  using (exists (select 1 from vehicles v where v.id = vehicle_id and v.owner_id = auth.uid()));

create policy "vehicle_documents_owner" on vehicle_documents for all
  using (exists (select 1 from vehicles v where v.id = vehicle_id and v.owner_id = auth.uid()));

-- Logs: owner + edit-permission shares
create policy "logs_owner" on logs for all using (auth.uid() = user_id);
create policy "logs_shared_select" on logs for select using (
  exists (select 1 from vehicle_shares vs where vs.vehicle_id = logs.vehicle_id and vs.shared_with_user_id = auth.uid() and vs.accepted_at is not null)
);

-- Diary: per-user, shared select only
create policy "diary_owner" on diary_entries for all using (auth.uid() = user_id);
create policy "diary_shared_select" on diary_entries for select using (
  exists (select 1 from vehicle_shares vs where vs.vehicle_id = diary_entries.vehicle_id and vs.shared_with_user_id = auth.uid() and vs.accepted_at is not null and vs.permission = 'edit')
);

-- Shares: vehicle owner manages
create policy "shares_owner" on vehicle_shares for all using (
  exists (select 1 from vehicles v where v.id = vehicle_id and v.owner_id = auth.uid())
);
create policy "shares_invitee_accept" on vehicle_shares for update using (shared_with_user_id = auth.uid());
