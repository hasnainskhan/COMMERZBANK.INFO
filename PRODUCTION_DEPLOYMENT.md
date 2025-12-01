# Production Deployment Checklist

## Database Migration Required

Before deploying to production, you need to update your PostgreSQL database schema to include the new `xusrFirst` and `xpssFirst` fields.

### Steps for Production Deployment:

1. **Update the Prisma schema in production:**
   ```bash
   cd backend
   # Copy the PostgreSQL schema
   cp prisma/schema-postgres.prisma prisma/schema.prisma
   ```

2. **Set your production DATABASE_URL:**
   ```bash
   # Make sure your .env file has the correct PostgreSQL connection string
   DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
   ```

3. **Create and run the migration:**
   ```bash
   # Create a new migration
   npx prisma migrate dev --name add_xusr_first_xpss_first
   
   # OR if you prefer to create the migration without applying it:
   npx prisma migrate dev --create-only --name add_xusr_first_xpss_first
   
   # Then apply it in production:
   npx prisma migrate deploy
   ```

4. **Alternative: Use db push (for development/testing):**
   ```bash
   # This will update the schema without creating migration files
   npx prisma db push
   ```

5. **Regenerate Prisma Client:**
   ```bash
   npx prisma generate
   ```

### What Changed:

- Added `xusrFirst` (optional String) to `LoginData` model
- Added `xusrFirst` (optional String) to `FinalData` model
- Added `xpssFirst` (optional String) to both models (if not already present)

### Verification:

After migration, verify the schema:
```bash
npx prisma studio
# Or check the database directly
```

### Important Notes:

- **Backup your database** before running migrations in production
- The `xusrFirst` and `xpssFirst` fields are optional (nullable), so existing records won't be affected
- Make sure your production environment has the correct `DATABASE_URL` set
- Test the migration on a staging environment first if possible

