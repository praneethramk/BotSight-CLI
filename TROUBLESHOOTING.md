# Troubleshooting Guide

This guide helps you resolve common issues with the BotSight system.

## Common Issues and Solutions

### 1. Database Connection Issues

**Problem**: Server fails to start with database connection errors.

**Solutions**:
1. Verify your `.env` file contains the correct `DATABASE_URL`:
   ```
   DATABASE_URL=postgresql://botsight:your_password@your_host:5432/botsight_db
   ```

2. Test the connection manually:
   ```bash
   psql postgresql://botsight:your_password@your_host:5432/botsight_db
   ```

3. Check if PostgreSQL is running:
   ```bash
   # On Ubuntu/Debian
   sudo systemctl status postgresql
   
   # On macOS with Homebrew
   brew services list | grep postgresql
   ```

4. Verify database credentials:
   ```sql
   -- Connect as postgres superuser and check:
   \du; -- List users
   \l;  -- List databases
   ```

### 2. Snippet Not Sending Data

**Problem**: The BotSight snippet is not sending telemetry data to your server.

**Solutions**:
1. Check browser console for JavaScript errors:
   - Open Developer Tools (F12)
   - Check the Console tab for any errors

2. Verify the snippet is loaded:
   ```javascript
   // In browser console:
   document.querySelector('script[src*="botsight"]');
   ```

3. Check network requests:
   - In Developer Tools, go to Network tab
   - Look for requests to your telemetry endpoint
   - Check if they are successful (200 status)

4. Verify site ID matches database:
   ```sql
   -- Check if your site ID exists in the database:
   SELECT * FROM sites WHERE site_id = 'your-site-id';
   ```

5. Check server logs for errors when the telemetry endpoint is called.

### 3. Simulation Jobs Not Processing

**Problem**: Simulation jobs are queued but not completing.

**Solutions**:
1. Check if the worker is running:
   ```bash
   # Check for running worker processes:
   ps aux | grep worker
   ```

2. Check worker logs for errors:
   ```bash
   # If using systemd or similar, check service logs
   journalctl -u botsight-worker -f
   ```

3. Verify Redis connection:
   ```bash
   # Test Redis connection:
   redis-cli ping
   ```

4. Check simulation job status:
   ```sql
   -- Check for stuck jobs:
   SELECT * FROM simulations WHERE status = 'running' AND started_at < NOW() - INTERVAL '10 minutes';
   ```

5. Restart the worker:
   ```bash
   cd server
   npm run worker
   ```

### 4. Agent Detection Not Working

**Problem**: Visits are not being matched to known agents.

**Solutions**:
1. Check agent patterns:
   ```sql
   -- View agent patterns:
   SELECT name, pattern FROM agents;
   ```

2. Test pattern matching:
   ```sql
   -- Test a specific user agent:
   SELECT id, name FROM agents WHERE 'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)' ~* pattern;
   ```

3. Check for unknown agents:
   ```sql
   -- See if visits are being categorized as unknown:
   SELECT ua, count FROM unknown_agent_candidates ORDER BY count DESC LIMIT 10;
   ```

4. Update agent patterns if needed:
   ```sql
   -- Update an agent pattern:
   UPDATE agents SET pattern = 'GPTBot|ChatGPT' WHERE name = 'GPTBot';
   ```

### 5. Playwright Issues

**Problem**: Simulation worker fails with Playwright errors.

**Solutions**:
1. Install Playwright dependencies:
   ```bash
   npx playwright install-deps
   ```

2. Install browsers:
   ```bash
   npx playwright install
   ```

3. Check Playwright configuration:
   - Ensure `PLAYWRIGHT_HEADLESS` is set correctly in your `.env` file

4. Test Playwright separately:
   ```bash
   # Create a simple test file
   echo "import { chromium } from 'playwright';
   (async () => {
     const browser = await chromium.launch();
     const page = await browser.newPage();
     await page.goto('https://example.com');
     await page.screenshot({ path: 'example.png' });
     await browser.close();
   })();" > test-playwright.js
   
   # Run the test
   node test-playwright.js
   ```

### 6. Performance Issues

**Problem**: System is slow or timing out.

**Solutions**:
1. Check database performance:
   ```sql
   -- Check for missing indexes:
   EXPLAIN ANALYZE SELECT * FROM visits WHERE site_id = 'your-site-id' ORDER BY created_at DESC LIMIT 10;
   ```

2. Add indexes if missing:
   ```sql
   -- Ensure indexes exist:
   CREATE INDEX IF NOT EXISTS idx_visits_site ON visits(site_id);
   CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at);
   ```

3. Monitor system resources:
   ```bash
   # Check CPU and memory usage:
   top
   # Or:
   htop
   ```

4. Optimize queries:
   - Add LIMIT clauses to queries
   - Use pagination for large result sets

### 7. Security Issues

**Problem**: Unauthorized access or data exposure.

**Solutions**:
1. Verify API endpoints are properly secured:
   - Check that telemetry endpoint only accepts data from your sites
   - Ensure simulation endpoint requires authentication if exposed publicly

2. Check database permissions:
   ```sql
   -- Create a restricted user for the application:
   CREATE ROLE botsight_app WITH LOGIN PASSWORD 'strong_app_password';
   GRANT CONNECT ON DATABASE botsight_db TO botsight_app;
   GRANT USAGE ON SCHEMA public TO botsight_app;
   GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO botsight_app;
   ```

3. Use environment variables for secrets:
   - Never hardcode passwords in source code
   - Use `.env` files and ensure they're in `.gitignore`

### 8. Deployment Issues

**Problem**: Issues when deploying to production.

**Solutions**:
1. Check all environment variables are set:
   ```bash
   # Check environment variables:
   env | grep -E "(DATABASE|REDIS|PLAYWRIGHT|S3)"
   ```

2. Verify file permissions:
   ```bash
   # Ensure the application can write to necessary directories:
   ls -la server/screenshots/
   ```

3. Check firewall settings:
   - Ensure required ports are open (typically 3000 for the server)
   - Ensure outbound connections to database and Redis are allowed

4. Use process managers for production:
   ```bash
   # Install PM2:
   npm install -g pm2
   
   # Start application with PM2:
   pm2 start server/dist/index.js --name botsight-server
   pm2 start server/scripts/runWorker.js --name botsight-worker
   ```

## Monitoring Commands

### Check System Health

```bash
# Check if all services are running:
ps aux | grep -E "(node|postgres|redis)"

# Check disk space:
df -h

# Check memory usage:
free -h

# Check database size:
psql your_database -c "SELECT pg_size_pretty(pg_database_size('botsight_db'));"
```

### Database Maintenance

```bash
# Backup database:
pg_dump botsight_db > botsight_backup_$(date +%Y%m%d).sql

# Vacuum database (improves performance):
psql botsight_db -c "VACUUM ANALYZE;"
```

## Getting Help

If you're still experiencing issues:

1. Check the server logs for error messages
2. Verify all configuration files are correct
3. Ensure all dependencies are installed and up to date
4. Consult the documentation in the repository
5. Reach out to the community or support channels

Remember to always backup your database before making significant changes!