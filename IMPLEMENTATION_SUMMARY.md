# BotSight Implementation Summary

This document provides a summary of the BotSight backend implementation, including all the components that were created to support the required features.

## Directory Structure

```
botsight/
├── server/
│   ├── db/
│   │   └── ddl/
│   │       └── 01_create_tables.sql
│   ├── src/
│   │   ├── db/
│   │   │   └── index.ts
│   │   ├── routes/
│   │   │   ├── telemetry.ts
│   │   │   ├── config.ts
│   │   │   └── simulate.ts
│   │   ├── workers/
│   │   │   └── simulateWorker.ts
│   │   ├── jobs/
│   │   │   └── agentSyncJob.ts
│   │   ├── scripts/
│   │   │   ├── seed.ts
│   │   │   ├── runWorker.ts
│   │   │   └── runAgentSync.ts
│   │   └── index.ts
│   ├── tests/
│   │   ├── telemetry.test.ts
│   │   └── simulateWorker.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── packages/
│   └── snippet/
│       ├── src/
│       │   └── index.ts
│       ├── dist/
│       │   └── botsight.iife.js
│       ├── test.html
│       ├── package.json
│       ├── tsconfig.json
│       └── webpack.config.js
└── tools/
    └── cli/
        ├── simulate.ts
        ├── package.json
        └── tsconfig.json
```

## Implemented Features

### 1. Database Schema
- Created all required tables: agents, sites, visits, extracted_fields, unknown_agent_candidates, simulations
- Added appropriate indexes for performance
- Included seed data for initial agents and a demo site

### 2. API Endpoints
- `POST /v1/telemetry` - Accepts telemetry data from snippets
- `GET /v1/config/:siteId` - Returns site configuration
- `POST /v1/simulate` - Enqueues a simulation job

### 3. Client-side Snippet
- Created an IIFE snippet that can be embedded in web pages
- Uses `navigator.sendBeacon` for reliable telemetry transmission
- Extracts structured data (JSON-LD, OpenGraph, etc.)
- Respects llms.txt if present

### 4. Simulation Worker
- Playwright-based worker that simulates how AI agents see a page
- Extracts visible JSON-LD, meta tags, title, and h1 content
- Takes screenshots and stores them
- Updates job status in the database

### 5. Agent Sync Job
- Fetches agents from a remote JSON file
- Upserts agent data into the database
- Can be scheduled to run periodically

### 6. CLI Tools
- Command-line tool for enqueuing simulation jobs

### 7. Testing
- Unit tests for telemetry endpoint
- Unit tests for simulation worker

## Environment Variables

The server requires the following environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string (for job queue)
- `PLAYWRIGHT_HEADLESS` - Whether to run Playwright in headless mode
- `S3_BUCKET` - S3 bucket for storing screenshots (optional)
- `S3_CREDENTIALS` - S3 credentials (optional)
- `AGENTS_REMOTE_URL` - URL to fetch the canonical agents.json file

## How to Run

1. Set up the database:
   ```bash
   # Run the SQL scripts in server/db/ddl/
   # Set environment variables
   cd server
   npm run seed
   ```

2. Start the server:
   ```bash
   cd server
   npm start
   ```

3. Build the snippet:
   ```bash
   cd packages/snippet
   npm run build
   ```

4. Run the simulation worker:
   ```bash
   cd server
   npm run worker
   ```

5. Run the agent sync job:
   ```bash
   cd server
   npm run sync-agents
   ```

## Security & Privacy

- URLs are normalized to strip query strings and fragments
- No PII is stored except for hashed IP addresses (optional)
- Rate limiting should be implemented for production use
- CORS is properly configured for telemetry endpoints
- llms.txt is respected for agent disallow rules

## Next Steps

To make this production-ready, the following items should be implemented:

1. Add proper authentication and rate limiting
2. Implement a proper job queue (e.g., BullMQ with Redis)
3. Add monitoring and logging
4. Implement S3 storage for screenshots
5. Add more comprehensive tests
6. Add CI/CD pipeline
7. Add documentation for all APIs
8. Implement proper error handling and retry logic