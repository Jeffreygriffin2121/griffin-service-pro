# HeatPump Pro Supabase Deployment

This folder contains production-ready database assets for HeatPump Pro.

## Files

- `schema.sql`: full database schema (tables, indexes, triggers, RLS policies).
- `storage-policies.sql`: storage bucket setup and storage object policies.
- `migrations/20260710000100_heatpumppro_schema.sql`: migration-safe copy of schema.
- `migrations/20260710000200_heatpumppro_storage_policies.sql`: migration-safe copy of storage policies.

## Prerequisites

1. Install Supabase CLI.
2. Authenticate CLI:
   - `supabase login`
3. Link project:
   - `supabase link --project-ref <your-project-ref>`

## Deploy to Production

1. Confirm remote target:
   - `supabase projects list`
2. Push migrations:
   - `supabase db push`
3. Verify migration state:
   - `supabase migration list`
4. Verify buckets and policies in dashboard:
   - Storage -> Buckets (`photo-records`, `document-records`, `report-records`)
   - Database -> Policies (all business tables + storage.objects)

## Rollback Strategy

- Create a backup before deployment:
  - `supabase db dump --linked --file pre_release_backup.sql`
- If rollback is needed, restore from backup or deploy a corrective migration.

## Naming Convention for Storage Objects

Storage policies assume object keys are prefixed by `company_id`:

- `<company_id>/<installation_id>/photos/...`
- `<company_id>/<installation_id>/documents/...`
- `<company_id>/<installation_id>/reports/...`

If object paths do not follow this convention, access will be denied by policy.
