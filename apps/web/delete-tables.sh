#!/bin/bash

# Exit on error
set -e

# Check if .env file exists
if [ ! -f .env.local ]; then
    echo "Error: .env file not found"
    exit 1
fi

# Read DATABASE_URL from .env file
export $(grep DATABASE_URL .env.local | xargs)

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL not found in .env file"
    exit 1
fi

# Execute the PostgreSQL command to drop all tables in the public schema
psql "$DATABASE_URL" -c "
DO \$\$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename 
              FROM pg_tables 
              WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.\"' || r.tablename || '\" CASCADE';
    END LOOP;
END \$\$;
"

echo "All tables in the public schema have been dropped successfully"

