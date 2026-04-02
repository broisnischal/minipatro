# Mini Patro

Minimal foundation for a better Nepali calendar product:

- `React Router` + Cloudflare Workers
- `Drizzle ORM` + `SQLite` (Cloudflare D1)
- `better-auth` (email/password flow enabled)
- `shadcn/ui`
- `taze` for dependency upgrades
- clean, calendar-first UI (no dashboard clutter)

## Quick Start

1. Install dependencies

```bash
bun install
```

2. Create a D1 database (once) and update `wrangler.jsonc`

```bash
wrangler d1 create minipatro
```

3. Set Better Auth secret

```bash
wrangler secret put BETTER_AUTH_SECRET
```

Optional:

```bash
wrangler secret put BETTER_AUTH_URL
```

4. Generate and apply migrations

```bash
bun run db:generate
bun run db:migrate:local
```

5. Start dev server

```bash
bun run dev
```

## App Routes

- `/` minimal monthly calendar view
- `/auth/sign-up` create account
- `/auth/sign-in` sign in
- `/auth/session` view active session and sign out

All auth requests are handled by Better Auth at `/api/auth/*`.

## Database

- Schema source: `app/db/schema.ts`
- Drizzle config: `drizzle.config.ts`
- Generated SQL migrations: `drizzle/`
- Calendar tables:
  - `calendar_day` (one row per day, BS + AD + lunar/meta)
  - `calendar_event` (zero/more events per day)

## Auth

- Better Auth handler is mounted at `/api/auth/*` in `workers/app.ts`
- Auth server config lives in `app/lib/auth.server.ts`
- React client helper lives in `app/lib/auth-client.ts`

Example endpoint:

```txt
GET /api/auth/get-session
```

## Calendar Seed Data

Seed input file:

- `data/nepali-calendar.seed.json`

Generate seed input JSON automatically (AD -> BS):

```bash
bun run prepare:calendar:data
```

Optional custom range:

```bash
bun run scripts/prepare-nepali-calendar-data.ts --start-ad 2024-01-01 --end-ad 2030-12-31
```

Generate SQL from JSON:

```bash
bun run seed:calendar:sql
```

Apply to local D1:

```bash
bun run seed:calendar:local
```

Apply to remote D1:

```bash
bun run seed:calendar:remote
```

Generated seed SQL output:

- `drizzle/seed/calendar-seed.sql`

### Input Shape (v1)

Each day supports:

- AD date (`adDate`)
- BS date parts (`bsYear`, `bsMonth`, `bsDay`)
- month and weekday names in Nepali + English
- lunar fields (`tithi`, `paksha`, `nakshatra`, `yoga`, `karana`)
- sun/moon timings
- `events[]` with holiday/festival metadata

## Useful Scripts

```bash
bun run typecheck
bun run db:generate
bun run db:migrate:local
bun run db:migrate:remote
bun run db:studio
bun run prepare:calendar:data
bun run seed:calendar:sql
bun run seed:calendar:local
bun run seed:calendar:remote
bun run taze
```
