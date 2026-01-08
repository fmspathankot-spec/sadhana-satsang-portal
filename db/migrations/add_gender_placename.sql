-- Add gender and place_name columns to sadhaks table
ALTER TABLE sadhaks 
ADD COLUMN IF NOT EXISTS gender VARCHAR(10),
ADD COLUMN IF NOT EXISTS place_name VARCHAR(100);

-- Update place_name from places table for existing records
UPDATE sadhaks s
SET place_name = p.name
FROM places p
WHERE s.place_id = p.id AND s.place_name IS NULL;

-- Make place_name NOT NULL after populating existing data
ALTER TABLE sadhaks 
ALTER COLUMN place_name SET NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS sadhaks_gender_idx ON sadhaks(gender);
CREATE INDEX IF NOT EXISTS sadhaks_place_name_idx ON sadhaks(place_name);

-- Verify changes
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sadhaks' 
  AND column_name IN ('gender', 'place_name')
ORDER BY column_name;