---
description: Add translation keys to both Bulgarian and English message files consistently
argument-hint: <namespace.key> <bg-value> <en-value>
---

# Add Translation Keys

Add the specified translation key to both language files, keeping them in sync.

## Files to modify:
- `src/messages/bg.json`
- `src/messages/en.json`

## Rules:
1. Parse the namespace from the key (e.g. `kasko.newField` -> namespace `kasko`, key `newField`)
2. Add the key in the correct namespace in BOTH files
3. Keep keys alphabetically sorted within each namespace
4. If the namespace doesn't exist yet, create it in both files
5. Never remove or modify existing keys unless explicitly asked
6. Bulgarian text should be actual Bulgarian, not transliterated English

## Verify:
After adding, run `pnpm build` to ensure no missing key errors.
