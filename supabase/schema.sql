-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  household_size smallint default 2,
  dietary_preferences text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create profile automatically on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Meal plans
create table public.meal_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text,
  week_start date not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.meal_plans enable row level security;

create policy "Users can manage their own meal plans"
  on public.meal_plans for all
  using (auth.uid() = user_id);

-- Meal plan days
create table public.meal_plan_days (
  id uuid default uuid_generate_v4() primary key,
  meal_plan_id uuid references public.meal_plans(id) on delete cascade not null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  recipe_name text not null,
  servings smallint default 2,
  notes text
);

alter table public.meal_plan_days enable row level security;

create policy "Users can manage their own meal plan days"
  on public.meal_plan_days for all
  using (
    exists (
      select 1 from public.meal_plans
      where id = meal_plan_id and user_id = auth.uid()
    )
  );

-- Pantry items
create table public.pantry_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  quantity numeric not null default 1,
  unit text,
  category text,
  expiry_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.pantry_items enable row level security;

create policy "Users can manage their own pantry items"
  on public.pantry_items for all
  using (auth.uid() = user_id);

-- Shopping lists
create table public.shopping_lists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  meal_plan_id uuid references public.meal_plans(id) on delete set null,
  name text not null default 'Shopping List',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.shopping_lists enable row level security;

create policy "Users can manage their own shopping lists"
  on public.shopping_lists for all
  using (auth.uid() = user_id);

-- Shopping list items
create table public.shopping_list_items (
  id uuid default uuid_generate_v4() primary key,
  shopping_list_id uuid references public.shopping_lists(id) on delete cascade not null,
  name text not null,
  quantity numeric not null default 1,
  unit text,
  category text,
  checked boolean not null default false,
  notes text
);

alter table public.shopping_list_items enable row level security;

create policy "Users can manage their own shopping list items"
  on public.shopping_list_items for all
  using (
    exists (
      select 1 from public.shopping_lists
      where id = shopping_list_id and user_id = auth.uid()
    )
  );
