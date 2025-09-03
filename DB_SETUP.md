# Database Setup for BotSight

This document explains how to set up the PostgreSQL database for BotSight.

## Prerequisites

- PostgreSQL installed and running
- `psql` command-line tool available

## Steps

1. Create a database user and database:
   ```sql
   -- Run as postgres superuser
   CREATE ROLE botsight WITH LOGIN PASSWORD 'your_secure_password';
   CREATE DATABASE botsight_db OWNER botsight;
   ```

2. Connect to the database:
   ```bash
   psql postgresql://botsight:your_secure_password@your-db-host:5432/botsight_db
   ```

3. Run the DDL script:
   ```bash
   psql postgresql://botsight:your_secure_password@your-db-host:5432/botsight_db -f server/db/ddl/01_create_tables.sql
   ```

4. Seed the database with initial data:
   ```sql
   INSERT INTO agents (name, pattern, example_ua, source, last_seen)
   VALUES
     ('GPTBot', 'GPTBot', 'GPTBot/1.0', 'builtin', now()),
     ('PerplexityBot', 'Perplexity', 'PerplexityBot/1.0', 'builtin', now()),
     ('ClaudeBot', 'Claude', 'Claude-Web/1.0', 'builtin', now()),
     ('GeminiBot', 'Gemini', 'Gemini/1.0', 'builtin', now())
   ON CONFLICT DO NOTHING;

   -- Replace 'your-site-id' and 'https://yourwebsite.com' with your actual values
   INSERT INTO sites (site_id, canonical_url, owner_email)
   VALUES ('your-site-id', 'https://yourwebsite.com', 'you@yourwebsite.com')
   ON CONFLICT DO NOTHING;
   ```

5. Verify the setup:
   ```sql
   SELECT count(*) FROM agents;
   SELECT count(*) FROM sites;
   ```

The database is now ready for use with BotSight!