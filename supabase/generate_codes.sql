-- RUN THIS IN SUPABASE SQL EDITOR
-- This script generates 10,000 random, unique activation codes.
-- Format: EJ-[5 RANDOM ALPHANUMERIC CHARS]

DO $$
DECLARE
    i INT := 1;
    new_code VARCHAR(50);
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    len INT := 5;
BEGIN
    WHILE i <= 10000 LOOP
        -- Generate random 5 character string
        new_code := 'EJ-' || (
            SELECT string_agg(substr(chars, (random() * 35 + 1)::integer, 1), '')
            FROM generate_series(1, len)
        );

        -- Insert if it doesn't already exist to avoid unique constraint errors
        BEGIN
            INSERT INTO activation_codes (code) VALUES (new_code);
            i := i + 1;
        EXCEPTION WHEN unique_violation THEN
            -- Do nothing, let the loop try again with a newly generated code
        END;
    END LOOP;
END $$;

-- TO EXPORT TO LYNK.ID:
-- Run this query below, then click "Export to CSV" in the Supabase Editor.
-- SELECT code FROM activation_codes WHERE is_used = false;
