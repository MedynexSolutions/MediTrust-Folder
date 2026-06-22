# Migration Report

## Summary

The backend persistence layer now uses Supabase through a reusable client and table-backed model adapters. Existing routes, controllers, middleware, request bodies, response shapes, and auth token flow were preserved.

## Database Layer Changes

- Added a reusable Supabase client in `src/config/supabase.js`.
- Converted `src/config/db.js` into a Supabase readiness check while keeping the existing `connectDB` import stable.
- Replaced schema-based model definitions with Supabase-backed model adapters.
- Preserved controller-facing model methods used by the app:
  - `create`
  - `find`
  - `findOne`
  - `findById`
  - `select('-password')`
  - `matchPassword`

## Tables

- `users`
- `appointments`
- `doctor_profiles`
- `health_records`
- `prescriptions`
- `medicines`

## Validation

- Dependency metadata contains no legacy database driver packages.
- Source scan for legacy database package names returns no matches.
- `node --check src/server.js` passes.
- Import smoke test for the app and user model passes with placeholder Supabase environment values.

## Notes

Run `SUPABASE_SCHEMA.sql` in the Supabase SQL editor before starting the backend against a live project.
