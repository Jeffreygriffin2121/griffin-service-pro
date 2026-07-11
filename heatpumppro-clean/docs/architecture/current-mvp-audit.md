# HeatPump Pro MVP Architecture Audit

Date: 2026-07-10

## App Shell
- Framework: Expo Router with React Native Web support.
- Root layout: `src/app/_layout.tsx` uses `AuthProvider`, `ThemeProvider`, and stack navigation with hidden native headers.
- Main dashboard route: `src/app/index.tsx`.

## Routing Structure (Current)
- Auth/account: `/sign-in`, `/create-account`, `/forgot-password`, `/update-password`, `/account`.
- Installations: `/installations`, `/installations/new`, `/installations/[installationId]`, `/installations/[installationId]/edit`, `/installations/[installationId]/photos`, `/installations/[installationId]/service-visit`, `/installations/[installationId]/equipment-passport`.
- Existing modules: `/fault-finder`, `/commissioning-wizard`, `/service-checklist`, `/reports`, `/photos`, `/verified-field-fixes`, `/ai-diagnostics`, `/coming-soon`.

## Authentication and Company Isolation
- Auth state/context: `src/features/auth/auth-context.tsx`.
- Auth services: `src/services/cloud/auth/auth-session-service.ts`.
- Provider selection: `src/services/cloud/providers/provider-selector.ts`.
- Cloud provider: `src/services/cloud/providers/cloud-supabase-provider.ts`.
- Local demo provider: `src/services/cloud/providers/local-demo-provider.ts`.
- Company isolation is enforced via repository/provider scope checks (`company_id` matching and access checks).

## Data and Cloud Layer
- Repository selector: `src/services/cloud/repositories/repository-selector.ts`.
- Installations (cloud): `src/services/cloud/repositories/cloud-installation-repository.ts`.
- Installations (local): `src/services/cloud/repositories/local-installation-repository.ts`.
- Supabase client: `src/services/cloud/supabase-client.ts`.
- Frontend environment usage is limited to publishable URL and anon key vars.

## UI Foundations
- Shared components currently in `src/components/`: `app-header`, `primary-button`, `section-card`, `form-input`, `form-select`, sync badges, and installation/equipment UI.
- Visual style: HeatPump Pro blue brand, rounded cards/buttons, high-touch controls.

## Installations and Catalogue
- Installations list/detail/edit/create routes are implemented and repository-backed.
- Installation form component: `src/components/installations/installation-form.tsx`.
- Equipment selector: `src/components/equipment/equipment-selector.tsx`.
- Catalogue/manufacturer data: `src/data/equipment/manufacturers.ts`, `src/data/equipment/models/index.ts`, `src/data/equipment/catalogue.ts`.

## Known Constraints Before Refactor
- Existing route contracts must remain stable for auth/installations flows.
- Existing save logic and company scoping must not change.
- Production web configuration and hosting setup already exist and must be preserved.
