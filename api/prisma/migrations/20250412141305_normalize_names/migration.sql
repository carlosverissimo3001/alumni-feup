-- CreateExtension
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Update names in alumni table
UPDATE "alumni"
SET 
    "full_name" = unaccent("full_name"),
    "first_name" = unaccent("first_name"),
    "last_name" = unaccent("last_name")
WHERE 
    "full_name" IS NOT NULL 
    OR "first_name" IS NOT NULL 
    OR "last_name" IS NOT NULL; 