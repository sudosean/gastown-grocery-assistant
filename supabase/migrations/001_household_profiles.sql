-- Household profiles for user onboarding

create table if not exists household_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  num_adults integer not null default 2,
  num_children integer not null default 0,
  dietary_preferences text[] not null default '{}',
  allergies text[] not null default '{}',
  intolerances text[] not null default '{}',
  weekly_budget_cents integer not null default 20000,
  cooking_time_per_meal_minutes integer not null default 30,
  preferred_cuisines text[] not null default '{}',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger household_profiles_updated_at
  before update on household_profiles
  for each row execute function update_updated_at();

-- RLS: users can only access their own profile
alter table household_profiles enable row level security;

create policy "Users can view their own profile"
  on household_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on household_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on household_profiles for update
  using (auth.uid() = user_id);
