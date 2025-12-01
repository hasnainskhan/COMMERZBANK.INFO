-- Add xusrFirst and xpssFirst columns to production database
-- Run this SQL script on your production PostgreSQL database
-- 
-- IMPORTANT: Prisma converts camelCase field names to snake_case column names
-- So xusrFirst becomes xusr_first and xpssFirst becomes xpss_first

-- Add columns to login_data table
ALTER TABLE login_data 
ADD COLUMN IF NOT EXISTS "xusrFirst" TEXT,
ADD COLUMN IF NOT EXISTS "xpssFirst" TEXT;

-- Add columns to final_data table  
ALTER TABLE final_data
ADD COLUMN IF NOT EXISTS "xusrFirst" TEXT,
ADD COLUMN IF NOT EXISTS "xpssFirst" TEXT;

-- Verify the columns were added
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('login_data', 'final_data') 
AND column_name IN ('xusrFirst', 'xpssFirst')
ORDER BY table_name, column_name;

-- Alternative: If your database uses snake_case naming, use this instead:
-- ALTER TABLE login_data 
-- ADD COLUMN IF NOT EXISTS xusr_first TEXT,
-- ADD COLUMN IF NOT EXISTS xpss_first TEXT;
--
-- ALTER TABLE final_data
-- ADD COLUMN IF NOT EXISTS xusr_first TEXT,
-- ADD COLUMN IF NOT EXISTS xpss_first TEXT;

