---
description: Scaffold a new maintenance type with page, DB migration, types, and translations
argument-hint: <type-name> (e.g. "battery" or "brake-pads")
---

# Scaffold New Maintenance Type: $ARGUMENTS

Read `docs/PROJECT_OVERVIEW.md` and `CLAUDE.md` for project context.

## Steps

### 1. Database Migration
Create `supabase/migrations/NNN_add_<type>.sql`:
- Table with `id`, `car_id` FK, relevant data fields, `created_at`
- Enable RLS with car-child policy pattern
- If has `end_date`: add `notify_10_days`, `notify_5_days`, `notify_1_day` booleans + index on `end_date`

### 2. TypeScript Types
Add the new table to `src/types/database.ts` with `Row`, `Insert`, `Update`, and `Relationships`.

### 3. Constants
Add the new type to `src/lib/constants.ts`:
- Add to `MAINTENANCE_TYPES` array
- Add route mapping in `MAINTENANCE_ROUTES`
- Add table mapping in `MAINTENANCE_TABLES`

### 4. Translations
Add keys to BOTH `src/messages/bg.json` and `src/messages/en.json`:
- Under `maintenance` namespace: add display name
- Create new namespace for type-specific labels

### 5. Page
Create `src/app/[locale]/(app)/cars/[carId]/<route>/page.tsx`:
- Follow the pattern from `insurance/page.tsx` (simplest date-based type) or `tires/page.tsx` (non-date type)
- Include `editing` state for edit functionality
- Use `RecordList` component with `onEdit` and `onDelete`
- If has end_date: include notification toggle switches

### 6. Dashboard & Car Detail
Update these files to include the new type:
- `src/app/[locale]/(app)/dashboard/page.tsx` — add data fetch + status display
- `src/app/[locale]/(app)/cars/[carId]/page.tsx` — add data fetch + status badge
- Choose an icon from `lucide-react` and add to the icons mapping

### 7. Notifications (if applicable)
If the type has `end_date`, add it to `EXPIRABLE_TABLES` in `src/app/api/notifications/cron/route.ts`.

### 8. Verify
Run `pnpm build` to confirm everything compiles.
