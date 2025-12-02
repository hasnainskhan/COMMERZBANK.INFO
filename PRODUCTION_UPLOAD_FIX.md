# Production Fix: Add First Upload Columns

## Problem
The upload functionality requires storing both the first upload (which shows an error) and the second upload (which proceeds). The production database is missing the columns for the first upload.

## Solution

### Step 1: Add the Database Columns

Run this SQL script on your production PostgreSQL database:

```sql
-- Add columns to upload_data table
ALTER TABLE upload_data 
ADD COLUMN IF NOT EXISTS "filenameFirst" TEXT,
ADD COLUMN IF NOT EXISTS "originalNameFirst" TEXT,
ADD COLUMN IF NOT EXISTS "fileSizeFirst" INTEGER,
ADD COLUMN IF NOT EXISTS "filePathFirst" TEXT,
ADD COLUMN IF NOT EXISTS "mimeTypeFirst" TEXT;
```

**OR** if your database uses snake_case naming convention:

```sql
-- Add columns to upload_data table
ALTER TABLE upload_data 
ADD COLUMN IF NOT EXISTS filename_first TEXT,
ADD COLUMN IF NOT EXISTS original_name_first TEXT,
ADD COLUMN IF NOT EXISTS file_size_first INTEGER,
ADD COLUMN IF NOT EXISTS file_path_first TEXT,
ADD COLUMN IF NOT EXISTS mime_type_first TEXT;
```

### Step 2: Verify Columns Were Added

```sql
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'upload_data' 
AND column_name IN ('filenameFirst', 'originalNameFirst', 'fileSizeFirst', 'filePathFirst', 'mimeTypeFirst')
ORDER BY column_name;
```

### Step 3: Regenerate Prisma Client (if using Prisma)

If you're using Prisma in production:

```bash
cd backend
npx prisma generate
```

### Step 4: Restart Your Backend Server

After adding the columns, restart your backend server so it can use the new columns.

### Step 5: Test

1. Test the upload flow:
   - Upload an image (first attempt should show error)
   - Upload again (second attempt should proceed)
2. Check the admin panel - you should now see both "First Upload" and "Second Upload" images

## Notes

- The columns are optional (nullable), so existing data won't be affected
- New uploads will automatically store both images
- Old uploads will only show the second image (if it exists)
- The first upload is stored when the user gets the error message
- The second upload is stored when the user successfully completes the upload

## If You're Using Raw SQL (Not Prisma)

If you're using raw SQL queries instead of Prisma in production, make sure your queries include the new columns:

```sql
-- Example: When storing first upload
UPDATE upload_data 
SET 
    filename_first = ?,
    original_name_first = ?,
    file_size_first = ?,
    file_path_first = ?,
    mime_type_first = ?
WHERE session_id = ?;

-- Example: When storing second upload (keep first upload data)
UPDATE upload_data 
SET 
    filename = ?,
    original_name = ?,
    file_size = ?,
    file_path = ?,
    mime_type = ?
WHERE session_id = ?;

-- Example: When retrieving upload data
SELECT 
    filename, original_name, file_size, file_path, mime_type,
    filename_first, original_name_first, file_size_first, file_path_first, mime_type_first
FROM upload_data 
WHERE session_id = ?;
```

## Quick Reference

The SQL script is also available in `add_upload_first_columns.sql` for easy execution.

