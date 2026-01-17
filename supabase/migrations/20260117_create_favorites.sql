-- Create Favorites Table
create table if not exists favorites (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  product_id text not null, -- Changed from uuid/fk to text to allow loose coupling if products table is missing or has mismatching types
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, product_id)
);

-- Enable Row Level Security
alter table favorites enable row level security;

-- Create Policies
create policy "Allow public access" on favorites
  for all using (true) with check (true);
