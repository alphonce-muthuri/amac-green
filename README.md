# AMAC Green & Renewable Energy Platform

## Development (Bun)

This repo uses [Bun](https://bun.sh) as the package manager and script runner.

```bash
bun install
bun dev
```

Other scripts: `bun run build`, `bun run start`, `bun run lint`.

## Supabase database

Run [`scripts/amac-spec-migration.sql`](scripts/amac-spec-migration.sql) in the **Supabase SQL Editor** (same project as your app) so `orders` gets financing columns (`financing_decided_at`, etc.), `customer_program_profiles`, `product_packages`, and related objects. If you add columns manually and still see “column … not found in the schema cache”, use **Project Settings → API → Reload schema** (or wait a minute for PostgREST to refresh).
