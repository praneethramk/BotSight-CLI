# Quick Start Guide

Get BotSight up and running on your website in under 30 minutes.

## Prerequisites

- Node.js 16+
- PostgreSQL database
- Redis server
- Your hosted website

## Step 1: Clone and Setup

```bash
# Clone the repository
git clone <repository-url> botsight
cd botsight

# Install dependencies
npm install

# Build the project
npm run build
```

## Step 2: Configure Database

1. Create a PostgreSQL database:
   ```sql
   CREATE ROLE botsight WITH LOGIN PASSWORD 'your_secure_password';
   CREATE DATABASE botsight_db OWNER botsight;
   ```

2. Create `.env` file in the `server` directory:
   ```bash
   cd server
   cat > .env << EOF
   DATABASE_URL=postgresql://botsight:your_secure_password@localhost:5432/botsight_db
   REDIS_URL=redis://localhost:6379
   PLAYWRIGHT_HEADLESS=true
   PORT=3000
   HOST=0.0.0.0
   EOF
   ```

## Step 3: Initialize Database

```bash
# Run database migrations
npm run migrate

# Seed initial data
npm run seed
```

## Step 4: Add Your Website

```sql
-- Connect to your database and add your site
INSERT INTO sites (site_id, canonical_url, owner_email)
VALUES ('your-site-id', 'https://yourwebsite.com', 'you@yourwebsite.com')
ON CONFLICT DO NOTHING;
```

## Step 5: Start Services

In separate terminals:

```bash
# Terminal 1: Start the main server
cd server
npm start

# Terminal 2: Start the simulation worker
cd server
npm run worker

# Terminal 3: Start the agent sync job
cd server
npm run sync-agents
```

## Step 6: Deploy Snippet

1. Build the snippet:
   ```bash
   cd packages/snippet
   npm run build
   ```

2. Upload the snippet to your web server:
   - File location: `packages/snippet/dist/botsight.iife.js`
   - Upload to: `https://yourwebsite.com/js/botsight.iife.js`

3. Add to your website's HTML:
   ```html
   <script 
       src="https://yourwebsite.com/js/botsight.iife.js" 
       data-site-id="your-site-id" 
       async>
   </script>
   ```

## Step 7: Test Integration

1. Visit your website in a browser
2. Check the database for visits:
   ```sql
   SELECT * FROM visits WHERE site_id = 'your-site-id' ORDER BY created_at DESC LIMIT 5;
   ```

3. Run a test simulation:
   ```bash
   curl -X POST http://localhost:3000/v1/simulate \
        -H "Content-Type: application/json" \
        -d '{"siteId":"your-site-id","url":"https://yourwebsite.com","agentName":"GPTBot"}'
   ```

## Step 8: Monitor Activity

Check your database for activity:
```sql
-- View recent visits
SELECT v.*, a.name as agent_name 
FROM visits v 
LEFT JOIN agents a ON v.agent_id = a.id 
WHERE v.site_id = 'your-site-id' 
ORDER BY v.created_at DESC 
LIMIT 10;

-- View simulation results
SELECT * FROM simulations 
WHERE site_id = 'your-site-id' 
ORDER BY created_at DESC 
LIMIT 5;
```

## That's It!

Your BotSight system is now running and monitoring AI agent visits to your website.

For more detailed configuration and advanced features, see:
- [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup instructions
- [DATABASE_OPERATIONS.md](DATABASE_OPERATIONS.md) for database operations
- [MONITORING_DASHBOARD.md](MONITORING_DASHBOARD.md) for setting up dashboards
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for resolving issues