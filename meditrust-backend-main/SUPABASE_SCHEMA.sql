create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password text not null,
  role text not null default 'patient' check (role in ('patient', 'doctor', 'pharmacy')),
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
  experience text,
  "hospitalName" text,
  location text,
  availability text,
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

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

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
