# TODO — Remaining tasks to reach 100% production readiness

This file lists remaining implementable tasks across the repository. It is a living checklist for the release work and CI-driven validation.

IMPORTANT: Many items require environment secrets (Supabase service role key, Razorpay keys, SMTP credentials) and a staging Supabase project for integration tests.

Status legend: [ ] TODO  [•] In progress  [x] Done

Core Phase 1 & 2

[•] Roles & Auth
  - [x] Backend auth controller: role validation and profile upsert
  - [ ] Harden auth middleware to read role from profiles table and validate JWTs
  - [ ] Supabase RLS policies audit and enforcement for profiles and app tables

[ ] Onboarding
  - [ ] Implement onboarding endpoints (patient/doctor/pharmacy)
  - [ ] Frontend onboarding UI validation and persistence

Doctor Discovery (Phase 2)

[•] DB
  - [x] doctor_requests table created in SUPABASE_SCHEMA.sql
  - [ ] RLS for doctor_requests to allow patient insert and doctor selection

[ ] Backend
  - [ ] doctor discovery routes and controllers (search, claim, requests)

[ ] Frontend
  - [ ] Update FindDoctors page to show BOOK APPOINTMENT vs REQUEST CONSULTATION
  - [ ] Request Consultation modal and patient requests view

Phase 3 — Production services

[ ] Payments (Razorpay)
  - [ ] Server-side integration (orders, capture, refunds, subscriptions)
  - [ ] Webhook handlers with HMAC verification and idempotency
  - [ ] Transaction history and invoices (PDF generation + storage)

[ ] Medicines
  - [ ] Complete medicines schema, search API, frontend flows

[ ] Symptom Checker (AI)
  - [ ] Backend AI adapter, retries, timeouts, history/audit

[ ] Notifications
  - [ ] Notifications table, scheduler for reminders, email/push integration

Admin & Verification

[ ] Admin dashboard endpoints and UI
  - [ ] analytics endpoints
  - [ ] approvals/queues
  - [ ] subscription management

[ ] Doctor/Pharmacy verification flows
  - [ ] File uploads (licenses), admin review queue, audit trail

Security & Ops

[ ] Security hardening
  - [ ] Supabase RLS policies complete and tested
  - [ ] Helmet and secure headers on backend
  - [ ] Rate limiting and request throttling
  - [ ] CSRF protections where applicable
  - [ ] XSS prevention on frontend
  - [ ] Audit logs persisted to DB

[ ] Performance
  - [ ] Lazy loading and code-splitting on frontend
  - [ ] Query optimization and DB indexing (review slow queries)
  - [ ] Caching (react-query + CDN)
  - [ ] Bundle and image optimization

CI / CD / Tests

[ ] Tests
  - [ ] Unit tests (target 95% for critical modules)
  - [ ] Integration tests against staging Supabase
  - [ ] E2E tests (Cypress) covering patient/doctor/pharmacy/admin flows

[ ] CI/CD
  - [ ] GitHub Actions workflows to run lint, build, tests, migrations against staging
  - [ ] Secrets stored in GitHub Secrets for CI

Deployment

[ ] Create DEPLOYMENT_GUIDE.md and MIGRATION_GUIDE.md with step-by-step steps

Notes and next actions
- I can implement all backend and frontend endpoints, unit/integration tests, migrations and CI workflows, and push them to a feature branch for review.
- To run integration and E2E tests, CI will need staging Supabase credentials and other service credentials (Razorpay, SMTP, Push provider).

If you want me to start implementing code changes now, reply "Proceed: create branch feature/release-production and implement" and confirm that GitHub Actions secrets will be provided so CI can run integration tests and migrations.