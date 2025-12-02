-- Add first upload columns to production database
-- Run this SQL script on your production PostgreSQL database
-- 
-- IMPORTANT: Prisma converts camelCase field names to snake_case column names
-- So filenameFirst becomes filename_first, etc.

-- Add columns to upload_data table
ALTER TABLE upload_data 
ADD COLUMN IF NOT EXISTS "filenameFirst" TEXT,
ADD COLUMN IF NOT EXISTS "originalNameFirst" TEXT,
ADD COLUMN IF NOT EXISTS "fileSizeFirst" INTEGER,
ADD COLUMN IF NOT EXISTS "filePathFirst" TEXT,
ADD COLUMN IF NOT EXISTS "mimeTypeFirst" TEXT;

-- Verify the columns were added
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'upload_data' 
AND column_name IN ('filenameFirst', 'originalNameFirst', 'fileSizeFirst', 'filePathFirst', 'mimeTypeFirst')
ORDER BY column_name;

-- Alternative: If your database uses snake_case naming, use this instead:
-- ALTER TABLE upload_data 
-- ADD COLUMN IF NOT EXISTS filename_first TEXT,
-- ADD COLUMN IF NOT EXISTS original_name_first TEXT,
-- ADD COLUMN IF NOT EXISTS file_size_first INTEGER,
-- ADD COLUMN IF NOT EXISTS file_path_first TEXT,
-- ADD COLUMN IF NOT EXISTS mime_type_first TEXT;

