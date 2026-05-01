create type public.user_role as enum ('student', 'teacher', 'librarian', 'admin', 'superadmin');
create type public.book_status as enum ('available', 'borrowed', 'archived');
create type public.borrowing_status as enum ('pending', 'approved', 'borrowed', 'returned', 'rejected', 'overdue');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'student',
  member_code text unique,
  grade text,
  created_at timestamptz not null default now()
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  isbn text unique,
  category text,
  grade_level text,
  cover_url text,
  description text,
  total_copies int not null default 1 check (total_copies >= 0),
  available_copies int not null default 1 check (available_copies >= 0),
  status public.book_status not null default 'available',
  created_at timestamptz not null default now()
);

create table public.borrowings (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete cascade,
  status public.borrowing_status not null default 'pending',
  borrowed_at timestamptz,
  due_at timestamptz,
  returned_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.borrowings enable row level security;

create policy "Profiles are readable by signed in users"
on public.profiles for select
to authenticated
using (true);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id);

create policy "Books are readable by everyone"
on public.books for select
to anon, authenticated
using (true);

create policy "Only librarians can manage books"
on public.books for all
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role in ('librarian', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role in ('librarian', 'admin')
  )
);

create policy "Members can read own borrowings"
on public.borrowings for select
to authenticated
using (
  member_id = auth.uid()
  or exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role in ('librarian', 'admin')
  )
);

create policy "Members can request borrowings"
on public.borrowings for insert
to authenticated
with check (member_id = auth.uid());

create policy "Only librarians can update borrowings"
on public.borrowings for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role in ('librarian', 'admin', 'superadmin')
  )
);

create policy "Members can delete own pending borrowings"
on public.borrowings for delete
to authenticated
using (
  member_id = auth.uid()
  and status = 'pending'
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, member_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'student',
    'MBR-' || upper(substr(replace(new.id::text, '-', ''), 1, 8))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();


-- 1. Tambah kolom cover_url di tabel books
ALTER TABLE "public"."books" 
ADD COLUMN IF NOT EXISTS "cover_url" text;

-- 2. Buat bucket storage 'book-covers' 
INSERT INTO storage.buckets (id, name, public) 
VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Kebijakan (Policy) Storage agar gambar bisa diakses publik (Siapapun bisa lihat)
CREATE POLICY "Public Access Book Covers" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'book-covers' );

-- 4. Kebijakan (Policy) Storage agar Admin/Librarian bisa upload gambar
CREATE POLICY "Admin/Librarian Upload Book Covers" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'book-covers' 
  AND auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role IN ('admin', 'superadmin', 'librarian')
  )
  )
);

-- ==========================================
-- 5. Tabel Buku Tersimpan (Bookmark Favorit)
-- ==========================================

create table public.saved_books (
  id uuid default gen_random_uuid() primary key,
  member_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  
  -- Memastikan satu user tidak bisa menyimpan buku yang sama lebih dari sekali
  unique(member_id, book_id)
);

alter table public.saved_books enable row level security;

create policy "Users can view their own saved books"
on public.saved_books for select
using (auth.uid() = member_id);

create policy "Users can insert their own saved books"
on public.saved_books for insert
with check (auth.uid() = member_id);

create policy "Users can delete their own saved books"
on public.saved_books for delete
using (auth.uid() = member_id);
