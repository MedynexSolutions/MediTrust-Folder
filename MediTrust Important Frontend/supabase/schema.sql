-- MediTrust Supabase schema — run in SQL Editor (idempotent where possible)

-- ─── Profiles ───────────────────────────────────────────────────────────────
create table if not exists public.patient_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  city text,
  state text,
  country text default 'India',
  setup_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.doctor_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  setup_complete boolean not null default false,
  specialization text default 'general_physician',
  qualification text,
  experience_years integer default 0,
  license_number text,
  hospital_name text,
  hospital_address text,
  city text,
  state text,
  country text default 'India',
  rating numeric(3,2) default 4.5,
  is_verified boolean default false,
  profile_image text,
  consultation_fees jsonb default '{"offline":500,"chat":200,"audio":350,"video":450}'::jsonb,
  languages jsonb default '["English"]'::jsonb,
  slot_duration_minutes integer default 15,
  max_patients_per_slot integer default 2,
  walkin_reserve_percent integer default 30,
  available_slots jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pharmacy_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  pharmacy_name text,
  phone text,
  address text,
  city text,
  state text,
  setup_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Appointments ─────────────────────────────────────────────────────────────
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references auth.users (id) on delete set null,
  patient_email text not null,
  patient_name text,
  doctor_id uuid references public.doctor_profiles (id) on delete set null,
  doctor_email text,
  doctor_name text not null,
  specialization text,
  appointment_type text not null,
  appointment_date date not null,
  time_slot text not null,
  status text not null default 'pending',
  fee numeric(10,2) default 0,
  notes text,
  hospital_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Prescriptions ────────────────────────────────────────────────────────────
create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references auth.users (id) on delete set null,
  patient_email text not null,
  patient_name text,
  patient_phone text,
  doctor_id uuid references public.doctor_profiles (id) on delete set null,
  doctor_email text not null,
  doctor_name text not null,
  doctor_specialization text,
  doctor_license text,
  diagnosis text,
  medicines jsonb not null default '[]'::jsonb,
  additional_notes text,
  pharmacy_status text not null default 'pending',
  delivery_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Medicine catalog & orders ──────────────────────────────────────────────
create table if not exists public.medicines (
  id text primary key,
  name text not null,
  category text not null,
  price numeric(10,2) not null default 0,
  stock text not null default 'in_stock',
  description text,
  requires_prescription boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists public.medicine_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text,
  patient_id uuid references auth.users (id) on delete set null,
  patient_email text not null,
  patient_name text,
  patient_phone text,
  pharmacy_id uuid references public.pharmacy_profiles (id) on delete set null,
  pharmacy_name text,
  order_type text not null default 'pickup',
  preferred_date date,
  preferred_time_slot text,
  medicines jsonb not null default '[]'::jsonb,
  total_amount numeric(10,2) default 0,
  delivery_address text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Health logs ──────────────────────────────────────────────────────────────
create table if not exists public.health_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references auth.users (id) on delete cascade,
  patient_email text not null,
  log_type text not null,
  title text not null,
  description text,
  log_date date,
  severity text,
  medicine_name text,
  medicine_dose text,
  medicine_taken boolean default false,
  doctor_name text,
  reminder_time text,
  file_url text,
  file_type text,
  created_at timestamptz not null default now()
);

-- ─── RLS ────────────────────────────────────────────────────────────────────
alter table public.patient_profiles enable row level security;
alter table public.doctor_profiles enable row level security;
alter table public.pharmacy_profiles enable row level security;
alter table public.appointments enable row level security;
alter table public.prescriptions enable row level security;
alter table public.medicines enable row level security;
alter table public.medicine_orders enable row level security;
alter table public.health_logs enable row level security;

-- Patient profile policies
drop policy if exists "patient_profiles_select_own" on public.patient_profiles;
create policy "patient_profiles_select_own" on public.patient_profiles for select using (auth.uid() = id);
drop policy if exists "patient_profiles_insert_own" on public.patient_profiles;
create policy "patient_profiles_insert_own" on public.patient_profiles for insert with check (auth.uid() = id);
drop policy if exists "patient_profiles_update_own" on public.patient_profiles;
create policy "patient_profiles_update_own" on public.patient_profiles for update using (auth.uid() = id);

-- Doctor profile: own + public read when setup complete
drop policy if exists "doctor_profiles_select_own" on public.doctor_profiles;
create policy "doctor_profiles_select_own" on public.doctor_profiles for select using (auth.uid() = id or setup_complete = true);
drop policy if exists "doctor_profiles_insert_own" on public.doctor_profiles;
create policy "doctor_profiles_insert_own" on public.doctor_profiles for insert with check (auth.uid() = id);
drop policy if exists "doctor_profiles_update_own" on public.doctor_profiles;
create policy "doctor_profiles_update_own" on public.doctor_profiles for update using (auth.uid() = id);

-- Pharmacy profile policies (own row + public directory when setup complete)
drop policy if exists "pharmacy_profiles_select_own" on public.pharmacy_profiles;
create policy "pharmacy_profiles_select_own" on public.pharmacy_profiles for select
  using (auth.uid() = id or setup_complete = true);
drop policy if exists "pharmacy_profiles_insert_own" on public.pharmacy_profiles;
create policy "pharmacy_profiles_insert_own" on public.pharmacy_profiles for insert with check (auth.uid() = id);
drop policy if exists "pharmacy_profiles_update_own" on public.pharmacy_profiles;
create policy "pharmacy_profiles_update_own" on public.pharmacy_profiles for update using (auth.uid() = id);

-- Appointments
drop policy if exists "appointments_patient_select" on public.appointments;
create policy "appointments_patient_select" on public.appointments for select
  using (patient_id = auth.uid() or doctor_id = auth.uid());
drop policy if exists "appointments_patient_insert" on public.appointments;
create policy "appointments_patient_insert" on public.appointments for insert
  with check (patient_id = auth.uid());
drop policy if exists "appointments_doctor_update" on public.appointments;
create policy "appointments_doctor_update" on public.appointments for update
  using (doctor_id = auth.uid());

-- Prescriptions
drop policy if exists "prescriptions_select" on public.prescriptions;
create policy "prescriptions_select" on public.prescriptions for select
  using (patient_id = auth.uid() or doctor_id = auth.uid() or auth.role() = 'authenticated');
drop policy if exists "prescriptions_doctor_insert" on public.prescriptions;
create policy "prescriptions_doctor_insert" on public.prescriptions for insert
  with check (doctor_id = auth.uid());
drop policy if exists "prescriptions_pharmacy_update" on public.prescriptions;
create policy "prescriptions_pharmacy_update" on public.prescriptions for update
  using (auth.role() = 'authenticated');

-- Medicines catalog (read all authenticated)
drop policy if exists "medicines_select_all" on public.medicines;
create policy "medicines_select_all" on public.medicines for select using (auth.role() = 'authenticated');

-- Medicine orders
drop policy if exists "medicine_orders_select" on public.medicine_orders;
create policy "medicine_orders_select" on public.medicine_orders for select
  using (patient_id = auth.uid() or pharmacy_id = auth.uid());
drop policy if exists "medicine_orders_patient_insert" on public.medicine_orders;
create policy "medicine_orders_patient_insert" on public.medicine_orders for insert
  with check (patient_id = auth.uid());
drop policy if exists "medicine_orders_pharmacy_update" on public.medicine_orders;
create policy "medicine_orders_pharmacy_update" on public.medicine_orders for update
  using (pharmacy_id = auth.uid() or auth.role() = 'authenticated');

-- Health logs
drop policy if exists "health_logs_own" on public.health_logs;
create policy "health_logs_own" on public.health_logs for all
  using (patient_id = auth.uid()) with check (patient_id = auth.uid());

-- ─── Seed medicine catalog ────────────────────────────────────────────────────
insert into public.medicines (id, name, category, price, stock, description, requires_prescription) values
  ('med-1', 'Paracetamol 500mg', 'pain-relief', 25, 'in_stock', 'Pain reliever and fever reducer', false),
  ('med-2', 'Ibuprofen 400mg', 'pain-relief', 45, 'in_stock', 'Anti-inflammatory pain relief', false),
  ('med-3', 'Cetirizine 10mg', 'allergy', 35, 'in_stock', 'Antihistamine for allergies', false),
  ('med-4', 'Amoxicillin 500mg', 'antibiotics', 120, 'in_stock', 'Antibiotic - prescription required', true),
  ('med-5', 'Vitamin C 500mg', 'vitamins', 180, 'in_stock', 'Immune support supplement', false),
  ('med-6', 'Omeprazole 20mg', 'digestive', 85, 'in_stock', 'Acid reflux treatment', false),
  ('med-7', 'Metformin 500mg', 'diabetes', 55, 'in_stock', 'Diabetes medication - prescription required', true),
  ('med-8', 'Amlodipine 5mg', 'heart', 65, 'will_arrive_soon', 'Blood pressure medication', true)
on conflict (id) do nothing;

-- ─── Migrations (safe to re-run) ─────────────────────────────────────────────
alter table public.patient_profiles add column if not exists city text;
alter table public.patient_profiles add column if not exists state text;
alter table public.patient_profiles add column if not exists country text default 'India';
