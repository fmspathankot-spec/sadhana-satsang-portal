-- Add approval fields to sadhaks table
ALTER TABLE sadhaks 
ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN approved_at TIMESTAMP;

-- Add index for filtering approved sadhaks
CREATE INDEX sadhaks_is_approved_idx ON sadhaks(is_approved);