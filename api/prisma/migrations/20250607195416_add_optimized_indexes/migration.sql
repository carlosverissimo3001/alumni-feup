CREATE INDEX idx_alumni_fulltext ON "alumni"
USING GIN (to_tsvector('simple', "full_name" || ' ' || "first_name" || ' ' || "last_name"));
