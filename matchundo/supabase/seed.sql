-- Seed 10 sample screenings across Kochi, Thrissur, Kozhikode, Trivandrum, Kottayam
insert into screenings (id, match_name, venue_name, city, address, screening_datetime, description, poster_image_url, google_maps_link)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Argentina vs France - World Cup Final rematch',
    'JLN Stadium Ground',
    'Kochi',
    'Stadium Rd, Kaloor, Kochi, Kerala 682017',
    '2026-07-15 19:30:00+05:30',
    'Join thousands of passionate Albiceleste and Les Bleus fans for a giant screen experience at the iconic JLN Stadium Ground! High quality sound, food stalls, and an electrifying atmosphere.',
    '',
    'https://maps.app.goo.gl/yEHRj2qfX9X6Zt5r9'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Brazil vs Germany - Classic Football Screening',
    'Vasco Da Gama Square',
    'Kochi',
    'Fort Kochi, Kochi, Kerala 682001',
    '2026-07-16 22:00:00+05:30',
    'Experience the ultimate football rivalry by the beach. Fort Kochi Vasco Da Gama Square will host the screening under the stars. Free entry for all. Food trucks available.',
    '',
    'https://maps.app.goo.gl/9uK8X9wG5V4C7JqB8'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Spain vs Portugal - Iberian Derby',
    'Thekkinkadu Maidhani',
    'Thrissur',
    'Round South, Kuruppam, Thekkinkadu Maidan, Thrissur, Kerala 680001',
    '2026-07-17 19:30:00+05:30',
    'Thrissur''s favorite gathering spot hosts the Iberian Derby! Watch Ronaldo and Portugal take on Spain''s tiki-taka on a 40ft LED wall. Rainproof seating provided.',
    '',
    'https://maps.app.goo.gl/1d2E3F4G5H6I7J8K9'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'England vs Italy - European Giants Clash',
    'Thrissur Town Hall',
    'Thrissur',
    'Town Hall Rd, Palace Road, Thrissur, Kerala 680020',
    '2026-07-18 22:00:00+05:30',
    'An indoor screening event at the Thrissur Town Hall. Premium seating, high-fidelity audio system, and halftime commentary by local football legends.',
    '',
    'https://maps.app.goo.gl/2d3E4F5G6H7I8J9K0'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'Brazil vs Argentina - Superclásico de las Américas',
    'Kozhikode Beach Open Stage',
    'Kozhikode',
    'Beach Rd, Kozhikode, Kerala 673032',
    '2026-07-19 19:30:00+05:30',
    'The heart of Kerala football: Kozhikode Beach. A massive screening event expected to draw thousands. Experience the intense rivalry with the ocean breeze in the background.',
    '',
    'https://maps.app.goo.gl/3d4E5F6G7H8I9J0K1'
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'France vs Belgium - Semifinal Thriller',
    'Mananchira Square',
    'Kozhikode',
    'Mananchira, Kozhikode, Kerala 673001',
    '2026-07-20 22:00:00+05:30',
    'Set in the beautiful Mananchira Square, watch the neighborly battle of European heavyweights. Safe family environment, seating arrangements, and local Malabar refreshments.',
    '',
    'https://maps.app.goo.gl/4d5E6F7G8H9I0J1K2'
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    'Croatia vs Morocco - World Cup Rematch',
    'Kanakakkunnu Palace Ground',
    'Trivandrum',
    'Sooryakanthi Rd, Kanaka Nagar, Nanthancodu, Thiruvananthapuram, Kerala 695033',
    '2026-07-21 19:30:00+05:30',
    'Screening of the heavyweights under the lights at the historic Kanakakkunnu Palace grounds. Organized by Trivandrum Football Club. Stalls, face-painting, and jerseys.',
    '',
    'https://maps.app.goo.gl/5d6E7F8G9H0I1J2K3'
  ),
  (
    '88888888-8888-8888-8888-888888888888',
    'Germany vs Spain - Tactical Masterclass',
    'Shanghumukham Beach',
    'Trivandrum',
    'Shanghumukham, Thiruvananthapuram, Kerala 695008',
    '2026-07-22 22:00:00+05:30',
    'A majestic coastal screening at Shanghumukham Beach. Watch two World Cup champions collide on a massive seaside screen. Ample parking and sea-facing seating.',
    '',
    'https://maps.app.goo.gl/6d7E8F9G0H1I2J3K4'
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    'Uruguay vs Ghana - High-Drama Screening',
    'Nehru Stadium Kottayam',
    'Kottayam',
    'Nagampadam, Kottayam, Kerala 686001',
    '2026-07-23 19:30:00+05:30',
    'Relive the historic rivalry between Uruguay and Ghana! Kottayam''s Nehru Stadium hosts a grand screening event with high-intensity music, merchandise counters, and local snacks.',
    '',
    'https://maps.app.goo.gl/7d8E9F0G1H2I3J4K5'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Netherlands vs Argentina - Quarterfinal Rematch',
    'Thirunakkara Ground',
    'Kottayam',
    'Thirunakkara, Kottayam, Kerala 686001',
    '2026-07-24 22:00:00+05:30',
    'Watch the orange army face the blue-and-white in the historic Thirunakkara Ground. Grand seating capacity, multi-angle surround sound, and local football discussions at halftime.',
    '',
    'https://maps.app.goo.gl/8d9E0F1G2H3I4J5K6'
  )
on conflict (id) do update set
  match_name = excluded.match_name,
  venue_name = excluded.venue_name,
  city = excluded.city,
  address = excluded.address,
  screening_datetime = excluded.screening_datetime,
  description = excluded.description,
  poster_image_url = excluded.poster_image_url,
  google_maps_link = excluded.google_maps_link;
