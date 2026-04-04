# Kolata - Project Overview

## Business Context

Kolata is a mobile-first PWA for tracking car maintenance, built for the Bulgarian market. Users register via email, add their cars, and track 6 types of maintenance items. The app sends push and email notifications before items expire.

The name "Kolata" means "The Car" in Bulgarian.

### Target Users
- Bulgarian car owners who want a single place to track all recurring car-related expenses and deadlines
- Users who need reminders before insurance, vignette, or inspection expires

### Core Value Proposition
- Never miss a renewal deadline (insurance, kasko, vignette, technical inspection)
- Keep a history of oil changes with km tracking
- Track tire sets by season

---

## Features

### 1. Insurance (Застраховка)
Third-party liability insurance — mandatory in Bulgaria.
- **Fields:** company (free text), start date, end date, price
- **Notifications:** push (10/5/1 days before end) + email (14 days before)

### 2. Kasko (Каско)
Comprehensive/collision insurance — optional, separate from mandatory insurance.
- **Fields:** company, start date, end date, price
- **Type:** two options:
  - `cash_payout` — insurance evaluates damage and pays money
  - `partner_service` — insurance provides a partner repair shop
- **Free roadside assistance:** boolean toggle
- **Notifications:** push (10/5/1 days) + email (14 days)

### 3. Technical Inspection (Технически преглед)
Annual vehicle roadworthiness test — mandatory.
- **Fields:** start date, end date, price
- **Notifications:** push (10/5/1 days) + email (14 days)

### 4. Oil Change (Смяна на масло)
- **Fields:** change date, current km, next change km, oil type (free text), price
- **Next change date:** auto-computed as change_date + 1 year (read-only, displayed in UI and used for status badge)
- **No per-record notification toggles** (no end_date in DB; expiry derived from change_date + 1 year)

### 5. Vignette (Винетка)
Road toll sticker — required for highway driving in Bulgaria.
- **Fields:** start date, end date, price
- **Notifications:** push (10/5/1 days) + email (14 days)

### 6. Tires (Гуми)
Tire tracking by season — no expiry dates.
- **Fields:** season (winter / summer / all_season), year, brand
- **No notifications** — informational only
- **Status display:** checkmark if any tires added, "not set" otherwise (no expiry badge)

### Cross-cutting Features
- **Multi-car support:** each user can have multiple cars, all features scoped per car
- **Edit/delete** on all record types
- **Dark/light theme** toggle in bottom nav
- **Bilingual:** Bulgarian (default) and English, switchable in settings

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui (base-nova style, @base-ui/react) |
| Database + Auth | Supabase (PostgreSQL + Auth + Row Level Security) |
| i18n | next-intl (bg default, en) |
| Theme | next-themes (dark/light/system) |
| Forms | react-hook-form + zod |
| Dates | date-fns |
| Push Notifications | web-push + Service Worker |
| Email | Resend |
| Cron | Vercel Cron (daily 08:00 UTC) |
| Hosting | Vercel |
| Package Manager | pnpm |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (fonts, ThemeProvider, PWA)
│   ├── globals.css                   # Tailwind + shadcn theme variables
│   ├── [locale]/                     # i18n locale prefix (bg|en)
│   │   ├── layout.tsx                # NextIntlClientProvider
│   │   ├── page.tsx                  # Landing page
│   │   ├── (auth)/                   # Public auth routes
│   │   │   ├── layout.tsx            # Centered layout
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── (app)/                    # Protected routes
│   │       ├── layout.tsx            # Auth guard + MobileNav
│   │       ├── dashboard/page.tsx    # Summary of all cars
│   │       ├── cars/
│   │       │   ├── page.tsx          # Car list
│   │       │   ├── new/page.tsx      # Add car form
│   │       │   └── [carId]/
│   │       │       ├── page.tsx      # Car detail (links to all types)
│   │       │       ├── insurance/page.tsx
│   │       │       ├── kasko/page.tsx
│   │       │       ├── inspection/page.tsx
│   │       │       ├── oil-change/page.tsx
│   │       │       ├── vignette/page.tsx
│   │       │       └── tires/page.tsx
│   │       └── settings/page.tsx     # Language, push toggle, sign out
│   └── api/
│       ├── push/subscribe/route.ts   # Save push subscription
│       └── notifications/cron/route.ts  # Daily notification cron
├── components/
│   ├── ui/                           # shadcn/ui (button, card, input, etc.)
│   ├── layout/
│   │   ├── mobile-nav.tsx            # Bottom nav (Dashboard, Cars, Settings, theme toggle)
│   │   └── theme-toggle.tsx          # Sun/moon toggle
│   ├── cars/
│   │   └── delete-car-button.tsx
│   ├── dashboard/
│   │   └── status-badge.tsx          # Color-coded expiry badge
│   └── maintenance/
│       └── record-list.tsx           # Reusable list with edit/delete actions
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase client
│   │   ├── server.ts                 # Server Component Supabase client
│   │   ├── admin.ts                  # Service role client (for cron)
│   │   └── middleware.ts             # Session refresh helper
│   ├── constants.ts                  # MAINTENANCE_TYPES, route/table mappings
│   └── utils.ts                      # cn() helper
├── i18n/
│   ├── routing.ts                    # Locale list + default
│   ├── request.ts                    # Message loading
│   └── navigation.ts                 # Locale-aware Link, useRouter, etc.
├── messages/
│   ├── bg.json                       # Bulgarian translations
│   └── en.json                       # English translations
├── types/
│   └── database.ts                   # Supabase generated types (with Relationships)
└── middleware.ts                      # Auth redirect + i18n + session refresh
```

---

## Database Schema

9 tables, all with Row Level Security. See `supabase/migrations/001_initial_schema.sql` for full DDL.

### Key tables:
- **profiles** — extends auth.users, stores locale + push_subscription
- **cars** — user's vehicles (FK to profiles)
- **insurance, kasko, technical_inspection, vignette** — date-range records with per-record notification preferences (FK to cars)
- **oil_change** — km-based records, no end_date in DB (FK to cars)
- **tires** — season-based, no dates (FK to cars)
- **notification_log** — deduplication for sent notifications

### RLS pattern:
- `profiles`: `auth.uid() = id`
- `cars`: `auth.uid() = user_id`
- Child tables (insurance, kasko, etc.): `car_id IN (SELECT id FROM cars WHERE user_id = auth.uid())`

### Auto-profile creation:
A Postgres trigger `on_auth_user_created` inserts into `profiles` when a new user signs up.

---

## Authentication Flow

1. User registers/logs in via Supabase Auth (email + password)
2. `middleware.ts` runs on every request:
   - Refreshes Supabase session cookies
   - Redirects unauthenticated users to `/{locale}/login` (except public pages)
   - Redirects authenticated users away from login/register to `/{locale}/dashboard`
3. `(app)/layout.tsx` server component double-checks auth via `supabase.auth.getUser()`

---

## Notification System

### Channels:
- **Push** — via web-push library + service worker (`public/sw.js`)
- **Email** — via Resend API

### Triggers:
- **14 days before end_date** → email
- **10 / 5 / 1 days before end_date** → push (per user preference toggles on each record)

### Implementation:
- Vercel Cron calls `GET /api/notifications/cron` daily at 08:00 UTC
- Cron route uses admin Supabase client (bypasses RLS)
- Queries insurance, kasko, technical_inspection, vignette for matching end_dates
- Checks per-record `notify_X_days` booleans
- Deduplicates via `notification_log` table
- Sends via web-push / Resend

### Oil change:
- Not included in cron (no `end_date` column)
- Status badge on dashboard/car detail computes `change_date + 1 year` at render time

---

## Status Badge System

| Status | Condition | Badge Variant | Color |
|--------|-----------|--------------|-------|
| Valid | end_date > 30 days from now | `success` | Green (emerald) |
| Expiring Soon | end_date <= 30 days from now | `warning` | Amber/yellow |
| Expired | end_date < today | `destructive` | Red |
| Not Set | no record exists | `outline` | Gray border |

Tires use a simple checkmark (success) / "not set" (outline) since they have no expiry.

---

## i18n

- **Locales:** `bg` (default), `en`
- **URL structure:** `/{locale}/...` (e.g. `/bg/dashboard`, `/en/settings`)
- **Translation files:** `src/messages/bg.json`, `src/messages/en.json`
- **Namespaces:** common, auth, nav, cars, maintenance, insurance, kasko, inspection, oilChange, vignette, tires, notifications, status, landing

### Important: shadcn Select component
This project uses `@base-ui/react` Select (not Radix). `SelectValue` renders the raw value string by default. You must pass translated text as children to `SelectValue` to display labels correctly.

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=             # Supabase project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=  # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=            # Admin key (cron route)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=         # Web Push public key
VAPID_PRIVATE_KEY=                    # Web Push private key
RESEND_API_KEY=                       # Email via Resend
CRON_SECRET=                          # Bearer token for cron endpoint
```

---

## UI Conventions

- **Base font:** `text-lg` (18px), `font-semibold` (600) globally
- **Font weight:** all shadcn components use `font-semibold` (not default `font-medium`)
- **Mobile-first:** bottom nav bar with Dashboard, Cars, Settings, theme toggle
- **Theme:** dark/light via next-themes, CSS variables in globals.css
- **Spacing:** `space-y-4` for page sections, `space-y-2` for form fields
- **Links wrapping cards:** must use `className="block"` for spacing to work

---

## Common Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # ESLint
```
