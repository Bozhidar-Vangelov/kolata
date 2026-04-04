-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  locale text not null default 'bg',
  push_subscription jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Cars table
create table public.cars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  make text,
  model text,
  year int,
  license_plate text,
  created_at timestamptz not null default now()
);

alter table public.cars enable row level security;

create policy "Users can manage own cars"
  on public.cars for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Insurance table
create table public.insurance (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  company text not null,
  start_date date not null,
  end_date date not null,
  price decimal(10,2) not null,
  notify_10_days boolean not null default true,
  notify_5_days boolean not null default true,
  notify_1_day boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.insurance enable row level security;

create policy "Users can manage own insurance"
  on public.insurance for all
  using (car_id in (select id from public.cars where user_id = auth.uid()))
  with check (car_id in (select id from public.cars where user_id = auth.uid()));

-- Kasko table
create table public.kasko (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  company text not null,
  start_date date not null,
  end_date date not null,
  type text not null check (type in ('cash_payout', 'partner_service')),
  free_roadside boolean not null default false,
  price decimal(10,2) not null,
  notify_10_days boolean not null default true,
  notify_5_days boolean not null default true,
  notify_1_day boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.kasko enable row level security;

create policy "Users can manage own kasko"
  on public.kasko for all
  using (car_id in (select id from public.cars where user_id = auth.uid()))
  with check (car_id in (select id from public.cars where user_id = auth.uid()));

-- Technical inspection table
create table public.technical_inspection (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  price decimal(10,2) not null,
  notify_10_days boolean not null default true,
  notify_5_days boolean not null default true,
  notify_1_day boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.technical_inspection enable row level security;

create policy "Users can manage own inspections"
  on public.technical_inspection for all
  using (car_id in (select id from public.cars where user_id = auth.uid()))
  with check (car_id in (select id from public.cars where user_id = auth.uid()));

-- Oil change table
create table public.oil_change (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  change_date date not null,
  current_km int not null,
  next_change_km int not null,
  oil_type text not null,
  price decimal(10,2) not null,
  created_at timestamptz not null default now()
);

alter table public.oil_change enable row level security;

create policy "Users can manage own oil changes"
  on public.oil_change for all
  using (car_id in (select id from public.cars where user_id = auth.uid()))
  with check (car_id in (select id from public.cars where user_id = auth.uid()));

-- Vignette table
create table public.vignette (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  price decimal(10,2) not null,
  notify_10_days boolean not null default true,
  notify_5_days boolean not null default true,
  notify_1_day boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.vignette enable row level security;

create policy "Users can manage own vignettes"
  on public.vignette for all
  using (car_id in (select id from public.cars where user_id = auth.uid()))
  with check (car_id in (select id from public.cars where user_id = auth.uid()));

-- Tires table
create table public.tires (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  season text not null check (season in ('winter', 'summer', 'all_season')),
  year int,
  brand text,
  created_at timestamptz not null default now()
);

alter table public.tires enable row level security;

create policy "Users can manage own tires"
  on public.tires for all
  using (car_id in (select id from public.cars where user_id = auth.uid()))
  with check (car_id in (select id from public.cars where user_id = auth.uid()));

-- Notification log table
create table public.notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  record_type text not null,
  record_id uuid not null,
  days_before int not null,
  channel text not null check (channel in ('push', 'email')),
  sent_at timestamptz not null default now()
);

alter table public.notification_log enable row level security;

create policy "Users can view own notifications"
  on public.notification_log for select
  using (auth.uid() = user_id);

-- Indexes for notification cron performance
create index idx_insurance_end_date on public.insurance(end_date);
create index idx_kasko_end_date on public.kasko(end_date);
create index idx_technical_inspection_end_date on public.technical_inspection(end_date);
create index idx_vignette_end_date on public.vignette(end_date);
create index idx_notification_log_lookup on public.notification_log(record_type, record_id, days_before, channel);
