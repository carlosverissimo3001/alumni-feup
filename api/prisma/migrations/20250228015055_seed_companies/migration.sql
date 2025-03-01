-- This is an empty migration.
INSERT INTO company (id, name, linkedin_url, industry_id) VALUES
-- Damn, should've used @dbgenerated("gen_random_uuid()") instead of @default(uuid())
(gen_random_uuid(), 'Google', 'https://www.linkedin.com/company/google', 'cf96374d-d5bd-4d1b-8bf9-c539d3b17aef'),
(gen_random_uuid(), 'Apple', 'https://www.linkedin.com/company/apple', '65e2c6c8-fa40-4724-ba94-dc6cb8d22430'),
(gen_random_uuid(), 'Microsoft', 'https://www.linkedin.com/company/microsoft', 'cf96374d-d5bd-4d1b-8bf9-c539d3b17aef'),
(gen_random_uuid(), 'Amazon', 'https://www.linkedin.com/company/amazon', 'cf96374d-d5bd-4d1b-8bf9-c539d3b17aef'),
(gen_random_uuid(), 'Meta', 'https://www.linkedin.com/company/meta', 'cf96374d-d5bd-4d1b-8bf9-c539d3b17aef');
