# Grocery Assistant

An AI-powered meal planning and grocery management app. Set your household preferences, generate a weekly meal plan, track your pantry, and get a smart shopping list that subtracts what you already have.

## Features

- **AI Meal Planning** — Generate a personalized 7-day meal plan based on household size, dietary restrictions, budget, and cooking time
- **Meal Swaps** — Swap individual meals and the app learns your preferences over time
- **Pantry Tracking** — Add items via natural language (AI parses them into structured entries)
- **Smart Shopping Lists** — Auto-generated from your meal plan, with pantry items already subtracted
- **Authentication** — Supabase Auth with per-user data isolation via Row Level Security

## Prerequisites

- Node.js 18+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`npm install -g supabase`)
- An [Anthropic API key](https://console.anthropic.com/)
- A Supabase project (local or cloud)

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

```env
# Supabase — find these in your project dashboard under Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Anthropic — https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-...
```

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Start Supabase locally

```bash
supabase start
```

This starts a local Postgres + Auth + Studio stack. The CLI prints your local `SUPABASE_URL` and `ANON_KEY` — copy those into `.env.local`.

### 3. Apply the database schema

```bash
supabase db push
```

Or apply manually:

```bash
psql "$(supabase status | grep 'DB URL' | awk '{print $3}')" -f supabase/schema.sql
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Lint & Format

```bash
npm run lint      # ESLint via next lint
npm run format    # Prettier (writes in place)
```

## Project Structure

```
src/
  app/
    api/          # Route handlers (meal-plan, pantry, grocery-list, meals)
    auth/         # Login page + Supabase callback
    onboarding/   # First-run profile setup
    pantry/       # Pantry management UI
    plan/         # Weekly meal plan UI
    shopping/     # Shopping list UI
    profile/      # User preferences
  components/     # Shared React components
  lib/supabase/   # Browser and server Supabase clients
  types/          # TypeScript types
supabase/
  schema.sql      # Database schema (profiles, meal_plans, pantry_items, etc.)
  migrations/     # Schema migrations
```

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [Supabase](https://supabase.com/) (Postgres, Auth, RLS)
- [Anthropic Claude](https://www.anthropic.com/) (meal plan generation, pantry parsing)
- [Tailwind CSS](https://tailwindcss.com/)
- TypeScript
