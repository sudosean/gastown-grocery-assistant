-- Meal rejection history for preference learning

create table if not exists meal_rejections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_name text not null,
  rejection_reason text not null check (rejection_reason in ('dietary_issue', 'dislike', 'too_complex', 'too_expensive')),
  cuisine_tags text[] not null default '{}',
  ingredient_tags text[] not null default '{}',
  plan_date date,
  created_at timestamptz not null default now()
);

create index meal_rejections_user_id_idx on meal_rejections (user_id);
create index meal_rejections_created_at_idx on meal_rejections (user_id, created_at desc);

alter table meal_rejections enable row level security;

create policy "Users can view their own rejections"
  on meal_rejections for select
  using (auth.uid() = user_id);

create policy "Users can insert their own rejections"
  on meal_rejections for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own rejections"
  on meal_rejections for delete
  using (auth.uid() = user_id);
