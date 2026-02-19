# EternalQuants Platform

This is a full-stack quantitative trading model marketplace built with Next.js 14, FastAPI, Supabase, and Modal.

## 1. Setup Instructions

### Supabase Setup

1.  Create a new Supabase project.
2.  Go to the **SQL Editor** in your Supabase dashboard and run the following SQL script to create the schema and policies:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: profiles
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: models
create table public.models (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  description text,
  category text, -- 'mean_reversion', 'trend_following', 'arbitrage', 'ml_based', 'other'
  python_file_url text,
  data_file_url text,
  timeseries_name text,
  timeseries_description text,
  asset_class text,
  data_frequency text,
  date_range_start date,
  date_range_end date,
  status text default 'pending', -- 'pending', 'processing', 'completed', 'failed'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: model_metrics
create table public.model_metrics (
  id uuid default uuid_generate_v4() primary key,
  model_id uuid references public.models(id) on delete cascade not null,
  total_return float,
  annualized_return float,
  sharpe_ratio float,
  sortino_ratio float,
  max_drawdown float,
  win_rate float,
  profit_factor float,
  total_trades int,
  avg_trade_duration float,
  calmar_ratio float,
  calculated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: ratings
create table public.ratings (
  id uuid default uuid_generate_v4() primary key,
  model_id uuid references public.models(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  score int check (score >= 1 and score <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(model_id, user_id)
);

-- Table: comments
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  model_id uuid references public.models(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.models enable row level security;
alter table public.model_metrics enable row level security;
alter table public.ratings enable row level security;
alter table public.comments enable row level security;

-- Policies

-- Profiles
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile." on public.profiles for insert with check (auth.uid() = id);

-- Models (Using a simplified policy for now, assuming public read for completed models)
create policy "Completed models are viewable by everyone." on public.models for select using (true); 
create policy "Users can insert own models." on public.models for insert with check (auth.uid() = user_id);
create policy "Users can update own models." on public.models for update using (auth.uid() = user_id);
create policy "Users can delete own models." on public.models for delete using (auth.uid() = user_id);

-- Metrics
create policy "Metrics are viewable by everyone." on public.model_metrics for select using (true);

-- Ratings
create policy "Ratings are viewable by everyone." on public.ratings for select using (true);
create policy "Authenticated users can insert ratings." on public.ratings for insert with check (auth.uid() = user_id);
create policy "Users can update own ratings." on public.ratings for update using (auth.uid() = user_id);

-- Comments
create policy "Comments are viewable by everyone." on public.comments for select using (true);
create policy "Authenticated users can insert comments." on public.comments for insert with check (auth.uid() = user_id);

-- Triggers for handling new user signup to create profile
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

3.  Create two Storage buckets in Supabase:
    *   `model-files` (Private)
    *   `data-files` (Private)

### Modal Setup
1.  Sign up for [Modal.com](https://modal.com).
2.  Install Modal CLI locally: `pip install modal`.
3.  Run `modal token new` to generate credentials.
4.  Add these credentials to `backend/.env`.
5.  Deploy the executor app:
    ```bash
    cd backend
    modal deploy modal_app.py
    ```

### Environment Variables
1.  Copy `backend/.env.example` to `backend/.env` and fill in Supabase and Modal keys.
2.  Copy `.env.local.example` (if exists) in `frontend` and fill in Supabase keys.

## 2. Running Locally

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
Server running at `http://localhost:8000`

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Client running at `http://localhost:3000`

## 3. User Strategy Format
Users must upload a Python file with a `run_strategy(df)` function.
```python
def run_strategy(df):
    # df columns: Date, Open, High, Low, Close, Volume
    # Logic...
    return [{'entry_date': '...', 'exit_date': '...', 'position': 'long', ...}]
```
