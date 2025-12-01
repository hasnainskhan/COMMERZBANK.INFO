-- Production Database Migration SQL
-- Add xusrFirst and xpssFirst columns to login_data and final_data tables

-- Add columns to login_data table
ALTER TABLE login_data 
ADD COLUMN IF NOT EXISTS "xusrFirst" TEXT,
ADD COLUMN IF NOT EXISTS "xpssFirst" TEXT;

-- Add columns to final_data table  
ALTER TABLE final_data
ADD COLUMN IF NOT EXISTS "xusrFirst" TEXT,
ADD COLUMN IF NOT EXISTS "xpssFirst" TEXT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('login_data', 'final_data') 
AND column_name IN ('xusrFirst', 'xpssFirst')
ORDER BY table_name, column_name;

