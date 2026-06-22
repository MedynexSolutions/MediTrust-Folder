# MediTrust Supabase Backend Audit

Last updated: 2026-06-12

Run `supabase/schema.sql` in your Supabase SQL Editor before using integrated features.

## Setup checklist

1. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
2. Run `supabase/schema.sql` in Supabase SQL Editor (creates tables, RLS, medicine seed)
3. Run `npm run verify:supabase` to confirm connectivity
4. Enable Email auth (and optional Google OAuth) in Supabase Dashboard → Authentication

## Core entities — integrated

| Page | Current data source | Supabase table(s) | CRUD | Status |
|------|---------------------|-------------------|------|--------|
| **Welcome** | UI config + `localStorage` role | — | — | OK (no DB) |
| **SignIn / SignUp** | Supabase Auth + `profiles` API | `patient_profiles` / `doctor_profiles` / `pharmacy_profiles` | C/U | Integrated |
| **PatientSetup / DoctorSetup / PharmacySetup** | `AuthContext.completeSetup` | `*_profiles.setup_complete` | U | Integrated |
| **PatientDashboard** | `useAuth` + optional `meditrust_location` | `patient_profiles` (via auth) | R | Integrated |
| **DoctorDashboard** | `getDoctorDashboardStats`, appointments API | `appointments`, `doctor_profiles` | R | Integrated |
| **PharmacyDashboard** | orders + prescriptions API | `medicine_orders`, `prescriptions` | R | Integrated |
| **FindDoctors** | `listPublicDoctors()` | `doctor_profiles` | R | Integrated |
| **BookAppointment** | `getDoctorById`, `createAppointment`, slot occupancy | `doctor_profiles`, `appointments` | C/R | Integrated |
| **PatientAppointments** | `listAppointmentsByPatientEmail` | `appointments` | R | Integrated |
| **DoctorAppointments** | `listAppointmentsByDoctorId`, `updateAppointmentStatus` | `appointments` | R/U | Integrated |
| **WritePrescription** | `createPrescription` + doctor profile | `prescriptions`, `doctor_profiles` | C | Integrated |
| **PatientPrescriptions** | `listPrescriptionsByPatientEmail` | `prescriptions` | R | Integrated |
| **PharmacyOrders** | prescriptions + medicine orders APIs | `prescriptions`, `medicine_orders` | R/U | Integrated |
| **OrderMedicines** | `listMedicines`, `createMedicineOrder` | `medicines`, `medicine_orders` | R/C | Integrated |
| **HealthTracker** | `health_logs` API | `health_logs` | C/R/D | Integrated |
| **DoctorProfile** | `getDoctorProfileForUser`, `updateDoctorProfile` | `doctor_profiles` | R/U | Integrated |

## Pages still using static / local data (no Supabase table yet)

| Page | Current data source | Suggested table | CRUD | Missing |
|------|---------------------|-----------------|------|---------|
| **ChatAssistant** | Client-side chat state | `chat_messages` (future) | — | AI backend + persistence |
| **SymptomChecker** | Static symptom list + local UI | `symptom_assessments` (future) | — | Save assessments |
| **SkinScanner** | Local image / mock analysis | `skin_scans` (future) | — | Storage + AI API |
| **VerifyMedicine** | Hardcoded medicine DB object | `medicines` (extend) | R | Lookup by name |
| **Pharmacies** | Static pharmacy list | `pharmacy_profiles` (public view) | R | Public directory query |
| **SetLocation** | `patient_profiles` city/state + localStorage cache | `patient_profiles` | U | Integrated |
| **SubscriptionPlans** | Static plan arrays + demo alerts | `subscriptions` (future) | — | Stripe + DB |
| **UnifiedPricing / AdBoosters** | `localStorage` | `subscriptions` / `ad_boosters` | — | Billing integration |
| **SkincareProducts** | Static products + demo dermatologists | `products`, `doctor_profiles` | R | Catalog + affiliate |
| **SkinHealthcare** | Navigation only | — | — | OK |
| **DoctorAnalytics** | Likely static charts | `appointments` aggregates | R | Wire charts to API |
| **DoctorQueueSettings** | `updateDoctorProfile` API | `doctor_profiles` slot fields | U | Integrated |
| **PatientDashboard** quick counts | Hardcoded badge numbers | `appointments` / `prescriptions` counts | R | Dynamic counts |

## API modules (`src/lib/api/`)

| Module | Functions |
|--------|-----------|
| `appointments.js` | list by patient/doctor, create, update status, slot occupancy |
| `prescriptions.js` | list, create, update pharmacy status |
| `orders.js` | list medicine orders, create, update, pharmacy stats |
| `doctors.js` | list public, get by id, profile CRUD, dashboard stats |
| `medicines.js` | list catalog, UI mapper |
| `healthLogs.js` | list, create, delete |
| `pharmacyProfiles.js` | get, update |
| `profiles.js` (lib) | auth onboarding profiles |
