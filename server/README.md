# BotSight Server

This directory contains the backend server implementation for BotSight, including:

- API endpoints for telemetry, configuration, and simulation
- Database connection and migrations
- Workers for processing simulations
- Jobs for syncing agents

## Directory Structure

- `db/` - Database migrations and scripts
- `src/` - Source code for server implementation
  - `db/` - Database connection
  - `routes/` - API route handlers
  - `workers/` - Background workers
  - `jobs/` - Scheduled jobs
- `tests/` - Unit and integration tests

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables:
   ```bash
   export DATABASE_URL=postgresql://user:password@localhost:5432/botsight_db
   export REDIS_URL=redis://localhost:6379
   export PLAYWRIGHT_HEADLESS=true
   export S3_BUCKET=your-bucket-name
   export S3_CREDENTIALS=your-s3-credentials
   export AGENTS_REMOTE_URL=https://example.com/agents.json
   ```

3. Run database migrations:
   ```bash
   # Run the SQL scripts in db/ddl/ in order
   ```

4. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

- `POST /v1/telemetry` - Accepts telemetry data from snippets
- `GET /v1/config/:siteId` - Returns site configuration
- `POST /v1/simulate` - Enqueues a simulation job

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string for job queue
- `PLAYWRIGHT_HEADLESS` - Whether to run Playwright in headless mode
- `S3_BUCKET` - S3 bucket for storing screenshots
- `S3_CREDENTIALS` - S3 credentials for accessing the bucket
- `AGENTS_REMOTE_URL` - URL to fetch the canonical agents.json file