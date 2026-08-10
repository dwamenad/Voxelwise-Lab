create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id text primary key,
  slug text not null unique,
  title text not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  last_accessed_at timestamptz not null default now(),
  unique(user_id, course_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  completed boolean not null default false,
  completed_at timestamptz,
  last_viewed_at timestamptz not null default now(),
  unique(user_id, lesson_id),
  constraint completion_timestamp check ((completed and completed_at is not null) or (not completed))
);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;

create policy "Published courses are readable" on public.courses for select using (published = true);
create policy "Users read own profile" on public.profiles for select using ((select auth.uid()) = id);
create policy "Users insert own profile" on public.profiles for insert with check ((select auth.uid()) = id);
create policy "Users update own profile" on public.profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Users read own enrollments" on public.enrollments for select using ((select auth.uid()) = user_id);
create policy "Users enroll themselves" on public.enrollments for insert with check ((select auth.uid()) = user_id);
create policy "Users update own enrollments" on public.enrollments for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users leave own enrollments" on public.enrollments for delete using ((select auth.uid()) = user_id);
create policy "Users read own progress" on public.lesson_progress for select using ((select auth.uid()) = user_id);
create policy "Users create own progress" on public.lesson_progress for insert with check ((select auth.uid()) = user_id);
create policy "Users update own progress" on public.lesson_progress for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own progress" on public.lesson_progress for delete using ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

insert into public.courses (id, slug, title, published) values
  ('course-foundations', 'fsl-neuroimaging-foundations', 'FSL & Neuroimaging Foundations', true),
  ('course-preprocessing', 'fmri-preprocessing-fsl', 'fMRI Preprocessing with FSL', true),
  ('course-first-level', 'first-level-fmri-analysis-feat', 'First-Level fMRI Analysis in FEAT', true),
  ('course-higher-level', 'higher-level-fmri-analysis', 'Higher-Level fMRI Analysis', true),
  ('course-roi', 'roi-analysis-fsl', 'ROI Analysis with FSL', true),
  ('course-ppi-ica', 'ppi-and-ica', 'PPI and ICA', true)
on conflict (id) do update set title = excluded.title, slug = excluded.slug, published = excluded.published, updated_at = now();

