-- Add description column to notes table
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update the notes table definition in comments/documentation if needed
COMMENT ON COLUMN notes.description IS 'Optional description for image notes or extra details for text notes';
