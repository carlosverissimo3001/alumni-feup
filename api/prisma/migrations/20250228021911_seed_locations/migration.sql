-- This is an empty migration.
INSERT INTO location (id, city, country, country_code) VALUES
(gen_random_uuid(), 'New York', 'United States', 'US'),
(gen_random_uuid(), 'Porto', 'Portugal', 'PT'),
(gen_random_uuid(), 'Lisbon', 'Portugal', 'PT'),
(gen_random_uuid(), 'London', 'United Kingdom', 'UK'),
(gen_random_uuid(), 'Barcelona', 'Spain', 'ES');
