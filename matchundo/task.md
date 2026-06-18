# MatchUndo Sports Discovery Platform Transition Checklist

- [x] Update database schema (`prisma/schema.prisma`) with `sport`, `competition` on `Screening`, and create the `Report` model.
- [x] Push database schema changes locally (`pnpm exec prisma db push`).
- [x] Update database client layer (`src/lib/db.ts`) with new types, mappers, and report creation/fetching methods.
- [x] Implement server actions (`src/app/actions.ts`) for creating and resolving reports.
- [x] Create trust and compliance pages (Privacy, Terms, Disclaimer, Contact).
- [x] Update app footer navigation and disclaimers (`src/app/layout.tsx`).
- [x] Update `sitemap.ts` metadata route.
- [x] Update homepage (`src/app/page.tsx`) to be generic and display sport/competition badges on cards.
- [x] Update screenings list page (`src/app/screenings/page.tsx`) with search filters for Sport and Competition, and badges on cards.
- [x] Update screening detail page (`src/app/screenings/[id]/page.tsx`) to show badges and integrate the Report Listing modal workflow.
- [x] Implement report button client component (`src/components/ReportButton.tsx`).
- [x] Update venue detail page (`src/app/venues/[slug]/page.tsx`) to render badges on screening cards.
- [x] Update submit form page (`src/app/submit/page.tsx`) to allow users to specify optional Sport and Competition.
- [x] Update admin panels to allow edit/create with sport and competition:
  - [x] AdminPanel (`src/app/admin/AdminPanel.tsx`)
  - [x] SubmissionsPanel (`src/app/admin/submissions/SubmissionsPanel.tsx`) to support editing and viewing/resolving user reports.
- [x] Update seed data references to include multiple sports and competitions.
- [x] Run build and lint checks locally to ensure compile-readiness.

# Share Feature Transition Checklist
- [x] Implement Copy Link button with inline toasts and fallback on `/screenings/[id]`.
- [x] Implement Share on WhatsApp button with formatted message template.
- [x] Implement Native Share API button (hide if unsupported).
- [x] Update screening detail SEO metadata (Open Graph and Twitter properties).
- [x] Configure responsive wrapping flex layout on screening actions container.
- [x] Integrate sharing tracking analytics events (`copy_link`, `whatsapp_share`, `native_share`).
- [x] Verify build and lint checks pass cleanly.

# Resend Email Notifications Checklist
- [x] Set up Resend client and email utility helper functions (`src/lib/email.ts`).
- [x] Update database schema (`prisma/schema.prisma`) to support `notifyByEmail` preference.
- [x] Update database client layer (`src/lib/db.ts`) with new interface properties and mappings.
- [x] Integrate try-catch email sending wrappers inside `submitScreeningAction`, `approveScreeningAction`, and `rejectScreeningAction`.
- [x] Implement opt-in email notifications checkbox on the public submit form (`src/app/submit/page.tsx`).
- [x] Create comprehensive automated integration test suite (`test-email.ts`) verifying all flows.
- [x] Validate build and lint tasks pass successfully.

# Domain Configuration Refactor Checklist
- [x] Create centralized config helper `src/lib/config.ts` exporting `APP_URL`.
- [x] Refactor dynamic sitemap routing (`src/app/sitemap.ts`) to use `APP_URL`.
- [x] Refactor robots rules (`src/app/robots.ts`) to refer to sitemap using `APP_URL`.
- [x] Refactor email template base URLs (`src/lib/email.ts`) to use `APP_URL`.
- [x] Refactor sharing link fallbacks (`src/components/ShareButton.tsx`) to use `APP_URL`.
- [x] Inject alternates canonical metadata properties across all static pages:
  - [x] `/contact`, `/disclaimer`, `/privacy`, `/terms`, `/submit`, `/screenings`, `/venues`
- [x] Inject dynamic alternates canonical and Open Graph metadata URLs on detail pages:
  - [x] `/screenings/[id]`, `/venues/[slug]`
- [x] Update integration test runner (`test-email.ts`) to populate `NEXT_PUBLIC_APP_URL`.
- [x] Run production build and verification tests to confirm compile-readiness.

# Email Notification Reliability Checklist
- [x] Integrate safe logging inside `rejectScreeningAction` for rejection email success/failure states.
- [x] Configure client-side validation rules in `submit/page.tsx` to make email required when notifications are ON.
- [x] Update input label and required state attributes to reflect mandatory email field status when notifications checkbox is checked.
- [x] Implement matching server-side validation block in `submitScreeningAction` Server Action.
- [x] Expand integration test script (`test-email.ts`) to verify all new validation rules and rejection emails.
- [x] Validate build and lint tasks pass successfully.

# Venue Selection UX Improvements Checklist
- [x] Create reusable, keyboard-accessible searchable autocomplete `VenueSelector` component.
- [x] Resolve React render loop/cascading render warnings inside `VenueSelector`.
- [x] Implement `handleSelectVenue` to auto-fill Venue, Address, Maps link, and map City Selection.
- [x] Update predefined city list (15 cities) and add custom "Other" specify field.
- [x] Replace raw text competition field with Select dropdown and custom "Other" specify field.
- [x] Refactor Admin Dashboard modal creation and edit forms to support autocomplete, autofill, and custom select selectors.
- [x] Refactor Submissions moderation panel edit form to support autocomplete, autofill, and custom select selectors.
- [x] Run production compilation, ESLint, and integration tests to confirm compile-readiness.

# Timezone Rendering & Date Picker Polish Checklist
- [x] Create shared date formatting helper (`src/lib/date.ts`) to render in `Asia/Kolkata` (IST) timezone.
- [x] Replace all raw localized date and time formatting calls across listings, detail pages, venue pages, admin forms, and analytics lists.
- [x] Integrate timezone-aware formatters inside Resend email layouts.
- [x] Polish custom calendar highlight to use a single clean circle and remove surrounding box.
- [x] Verify production build, linting checks, and integration tests pass successfully.
