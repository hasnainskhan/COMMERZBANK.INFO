-- Initialize PostgreSQL database for Commerzbank application
-- This script runs when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist (already created by POSTGRES_DB env var)
-- But we can add any additional setup here

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Create any additional users or permissions if needed
-- (The main user is already created by POSTGRES_USER env var)

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Commerzbank database initialized successfully';
END $$;
