# BotSight Setup Guide

This guide explains how to set up and run the BotSight system.

## Prerequisites

1. Node.js (version 16 or higher)
2. PostgreSQL database
3. Redis server (for job queue)
4. Playwright dependencies

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd botsight
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build all packages:
   ```bash
   npm run build
   ```

## Database Setup

1. Create a PostgreSQL database and user:
   ```sql
   CREATE ROLE botsight WITH LOGIN PASSWORD 'your_secure_password';
   CREATE DATABASE botsight_db OWNER botsight;
   ```

2. Set the DATABASE_URL environment variable:
   ```bash
   export DATABASE_URL=postgresql://botsight:your_secure_password@your-db-host:5432/botsight_db
   ```

3. Run database migrations:
   ```bash
   cd server
   npm run migrate
   ```

4. Seed the database with initial data:
   ```bash
   npm run seed
   ```

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```bash
DATABASE_URL=postgresql://botsight:your_secure_password@your-db-host:5432/botsight_db
REDIS_URL=redis://your-redis-host:6379
PLAYWRIGHT_HEADLESS=true
S3_BUCKET=your-bucket-name
S3_CREDENTIALS=your-s3-credentials
AGENTS_REMOTE_URL=https://example.com/agents.json
PORT=3000
HOST=0.0.0.0
```

## Running the System

1. Start the main server:
   ```bash
   cd server
   npm start
   ```

2. In a separate terminal, start the simulation worker:
   ```bash
   cd server
   npm run worker
   ```

3. In another terminal, run the agent sync job:
   ```bash
   cd server
   npm run sync-agents
   ```

## Building the Snippet

To build the client-side snippet:

```bash
cd packages/snippet
npm run build
```

The built snippet will be available at `dist/botsight.iife.js`.

## Deploying the Snippet

1. Host the snippet file on your web server or a CDN:
   - Upload `packages/snippet/dist/botsight.iife.js` to your web server
   - Or use a CDN service to serve the file

2. Add the snippet to your website:
   ```html
   <script 
       src="https://your-website.com/path/to/botsight.iife.js" 
       data-site-id="your-site-id" 
       async>
   </script>
   ```

## Testing the System

1. Add the snippet to a test HTML page:
   ```html
   <script src="/path/to/botsight.iife.js" data-site-id="your-site-id" async></script>
   ```

2. Open the page in a browser to trigger telemetry collection.

3. Check the database to verify that visit data was recorded:
   ```sql
   SELECT * FROM visits WHERE site_id='your-site-id' ORDER BY created_at DESC LIMIT 5;
   ```

4. Enqueue a simulation job:
   ```bash
   curl -X POST http://your-server-host:3000/v1/simulate \
        -H "Content-Type: application/json" \
        -d '{"siteId":"your-site-id","url":"https://yourwebsite.com","agentName":"GPTBot"}'
   ```

5. Check the simulations table to verify the job was processed:
   ```sql
   SELECT * FROM simulations WHERE site_id='your-site-id' ORDER BY created_at DESC LIMIT 5;
   ```

## CLI Tools

The CLI tool can be used to enqueue simulation jobs:

```bash
cd tools/cli
npm run build
node dist/simulate.js your-site-id https://yourwebsite.com GPTBot
```

## Development

To run in development mode with hot reloading:

```bash
cd server
npm run dev
```

## Testing

To run tests:

```bash
cd server
npm test
```

## Troubleshooting

1. If you encounter issues with Playwright, install the dependencies:
   ```bash
   npx playwright install-deps
   ```

2. If you encounter database connection issues, verify your DATABASE_URL is correct.

3. If you encounter Redis connection issues, verify your REDIS_URL is correct and Redis is running.

4. If the snippet is not sending data, check:
   - The snippet is correctly loaded on your webpage
   - The data-site-id attribute matches your site ID in the database
   - The server is accessible from the browser
   - Browser console for any JavaScript errors