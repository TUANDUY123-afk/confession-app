-- Add metadata column to achievements table if it doesn't exist
-- This column stores unlocked_levels array and other achievement metadata

-- Check if metadata column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'achievements' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE achievements 
        ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
        
        -- Add comment for documentation
        COMMENT ON COLUMN achievements.metadata IS 'JSONB field storing unlocked_levels array and other achievement metadata';
        
        RAISE NOTICE 'Added metadata column to achievements table';
    ELSE
        RAISE NOTICE 'metadata column already exists in achievements table';
    END IF;
END $$;

