-- Create screenings table
create table if not exists screenings (
  id uuid default gen_random_uuid() primary key,
  match_name text not null,
  venue_name text not null,
  city text not null,
  address text not null,
  screening_datetime timestamp with time zone not null,
  description text,
  poster_image_url text,
  google_maps_link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index on city for faster filtering
create index if not exists screenings_city_idx on screenings(city);

-- Create index on screening_datetime for faster sorting
create index if not exists screenings_datetime_idx on screenings(screening_datetime);
