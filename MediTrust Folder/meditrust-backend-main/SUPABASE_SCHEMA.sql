create extension if not exists "pgcrypto";

-- Profiles table for unified profile storage used by the frontend and backend
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, -- Supabase auth user id
  role text not null default 'patient' check (role in ('patient', 'doctor', 'pharmacy', 'admin')),
  full_name text,
  email text,
  phone text,
  onboarding_completed boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Existing users table (legacy). Keep for compatibility but prefer profiles for app data.
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password text not null,
  role text not null default 'patient' check (role in ('patient', 'doctor', 'pharmacy', 'admin')),
  phone text,
  address text,
  "profileImage" text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  "patientId" uuid references public.users(id) on delete set null,
  "doctorId" uuid references public.users(id) on delete set null,
  date text,
  time text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.doctor_profiles (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid references public.users(id) on delete cascade,
  specialization text,
  qualification text,
  experience text,
  registration_number text,
  "hospitalName" text,
  clinic_name text,
  address text,
  city text,
  state text,
  location text,
  availability text,
  consultation_types text[],
  fees numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.health_records (
  id uuid primary key default gen_random_uuid(),
  "patientId" uuid references public.users(id) on delete set null,
  "doctorId" uuid references public.users(id) on delete set null,
  diagnosis text,
  treatment text,
  attachments text,
  date timestamptz not null default now()
);

create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  "patientId" uuid references public.users(id) on delete set null,
  "doctorId" uuid references public.users(id) on delete set null,
  medicines jsonb not null default '[]'::jsonb,
  notes text,
  date timestamptz not null default now()
);

create table if not exists public.medicines (
  id uuid primary key default gen_random_uuid(),
  name text,
  description text,
  manufacturer text,
  price numeric,
  stock integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Doctor requests table for demand-first discovery
create table if not exists public.doctor_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null,
  doctor_user_id uuid, -- if doctor exists and later claims
  doctor_name text,
  specialization text,
  city text,
  consultation_type text not null check (consultation_type in ('offline','chat','audio','video')),
  concern text,
  status text not null default 'requested' check (status in ('requested','doctor_contacted','doctor_joined','available_for_booking','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- triggers

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists set_appointments_updated_at on public.appointments;
create trigger set_appointments_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

drop trigger if exists set_doctor_profiles_updated_at on public.doctor_profiles;
create trigger set_doctor_profiles_updated_at
before update on public.doctor_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_medicines_updated_at on public.medicines;
create trigger set_medicines_updated_at
before update on public.medicines
for each row execute function public.set_updated_at();

drop trigger if exists set_doctor_requests_updated_at on public.doctor_requests;
create trigger set_doctor_requests_updated_at
before update on public.doctor_requests
for each row execute function public.set_updated_at();

-- RLS policies (applicable in Supabase):
-- Enable RLS on profiles and doctor_requests
alter table public.profiles enable row level security;
create policy "Profiles: allow users to manage own profile" on public.profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Allow service_role (server) to bypass with a function check (supabase service key will use full access)
-- Doctor requests: patients can insert their own requests; doctors can select requests targeted to their city/specialization once they claim profile
alter table public.doctor_requests enable row level security;

create policy "DoctorRequests: patients can insert" on public.doctor_requests
  for insert
  with check (auth.uid() = patient_id);

create policy "DoctorRequests: patients can select their requests" on public.doctor_requests
  for select
  using (auth.uid() = patient_id);

create policy "DoctorRequests: doctors can select when assigned or by city/specialization" on public.doctor_requests
  for select
  using (
    auth.role() = 'authenticated' AND (
      doctor_user_id = auth.uid() OR city = current_setting('request.city', true)
    )
  );

-- Note: current_setting('request.city') is a placeholder for server-side filtering via supabase service key; adapt when deploying.

-- Indexes for search
create index if not exists idx_doctor_profiles_specialization on public.doctor_profiles (lower(specialization));
create index if not exists idx_doctor_profiles_city on public.doctor_profiles (lower(city));
create index if not exists idx_doctor_profiles_state on public.doctor_profiles (lower(state));
create index if not exists idx_doctor_profiles_hospital on public.doctor_profiles (lower("hospitalName"));
create index if not exists idx_doctor_profiles_clinic on public.doctor_profiles (lower(clinic_name));

