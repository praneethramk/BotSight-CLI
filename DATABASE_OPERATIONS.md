# Database Operations Guide

This guide explains how to operate with the BotSight database to monitor and analyze AI agent visits to your website.

## Connecting to the Database

Use your preferred PostgreSQL client to connect to the database:

```bash
psql postgresql://botsight:your_secure_password@your-db-host:5432/botsight_db
```

Or use a GUI tool like pgAdmin, DBeaver, or SQL Workbench.

## Monitoring Visits

### View Recent Visits

```sql
SELECT 
    v.id,
    v.site_id,
    v.url,
    a.name AS agent_name,
    v.timestamp,
    v.created_at
FROM visits v
LEFT JOIN agents a ON v.agent_id = a.id
WHERE v.site_id = 'your-site-id'
ORDER BY v.created_at DESC
LIMIT 20;
```

### View Extracted Data

```sql
SELECT 
    v.id,
    v.url,
    a.name AS agent_name,
    v.extracted_summary,
    v.created_at
FROM visits v
LEFT JOIN agents a ON v.agent_id = a.id
WHERE v.site_id = 'your-site-id'
ORDER BY v.created_at DESC
LIMIT 10;
```

### View Extracted Fields

```sql
SELECT 
    ef.visit_id,
    ef.field_name,
    ef.field_value,
    ef.created_at
FROM extracted_fields ef
JOIN visits v ON ef.visit_id = v.id
WHERE v.site_id = 'your-site-id'
ORDER BY ef.created_at DESC
LIMIT 50;
```

## Analyzing Agent Behavior

### Top Agents by Visit Count

```sql
SELECT 
    a.name AS agent_name,
    COUNT(v.id) AS visit_count
FROM visits v
JOIN agents a ON v.agent_id = a.id
WHERE v.site_id = 'your-site-id'
GROUP BY a.name
ORDER BY visit_count DESC;
```

### JSON-LD Coverage by Agent

```sql
SELECT 
    a.name AS agent_name,
    COUNT(CASE WHEN v.extracted_summary->>'hasJsonLd' = 'true' THEN 1 END) AS jsonld_visits,
    COUNT(v.id) AS total_visits,
    ROUND(
        COUNT(CASE WHEN v.extracted_summary->>'hasJsonLd' = 'true' THEN 1 END) * 100.0 / COUNT(v.id), 
        2
    ) AS jsonld_coverage_pct
FROM visits v
JOIN agents a ON v.agent_id = a.id
WHERE v.site_id = 'your-site-id'
GROUP BY a.name
ORDER BY jsonld_coverage_pct DESC;
```

## Managing Agents

### View All Known Agents

```sql
SELECT 
    id,
    name,
    pattern,
    example_ua,
    source,
    last_seen,
    created_at
FROM agents
ORDER BY name;
```

### View Unknown Agents (Candidates for Review)

```sql
SELECT 
    id,
    ua,
    sample_site,
    count,
    first_seen,
    last_seen
FROM unknown_agent_candidates
ORDER BY count DESC, last_seen DESC;
```

### Add a New Agent

```sql
INSERT INTO agents (name, pattern, example_ua, source, last_seen)
VALUES 
    ('NewBot', 'NewBot/', 'NewBot/1.0', 'manual', now())
ON CONFLICT (name) DO UPDATE SET
    pattern = EXCLUDED.pattern,
    example_ua = EXCLUDED.example_ua,
    last_seen = now();
```

## Simulation Results

### View Recent Simulations

```sql
SELECT 
    id,
    site_id,
    url,
    agent_name,
    status,
    finished_at - started_at AS duration,
    result->'title' AS page_title,
    result->'h1' AS main_heading
FROM simulations
WHERE site_id = 'your-site-id'
ORDER BY finished_at DESC
LIMIT 10;
```

### View Simulation with Screenshot

```sql
SELECT 
    id,
    url,
    agent_name,
    status,
    screenshot_url,
    result
FROM simulations
WHERE site_id = 'your-site-id' 
    AND status = 'done'
    AND screenshot_url IS NOT NULL
ORDER BY finished_at DESC
LIMIT 5;
```

## Site Configuration

### View Site Configuration

```sql
SELECT 
    site_id,
    canonical_url,
    owner_email,
    snippet_version,
    config_json,
    created_at,
    updated_at
FROM sites
WHERE site_id = 'your-site-id';
```

### Update Site Configuration

```sql
UPDATE sites 
SET 
    config_json = '{"tracking": true, "debug": false}'::jsonb,
    updated_at = now()
WHERE site_id = 'your-site-id';
```

## Maintenance

### Clean Old Data (Optional)

```sql
-- Delete visits older than 90 days
DELETE FROM visits 
WHERE site_id = 'your-site-id' 
    AND created_at < NOW() - INTERVAL '90 days';
```

### Database Statistics

```sql
-- View table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Troubleshooting

### Check for Connection Issues

```sql
-- View active connections
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query
FROM pg_stat_activity
WHERE state = 'active';
```

### Check for Failed Simulations

```sql
SELECT 
    id,
    url,
    agent_name,
    status,
    result->'error' AS error_message
FROM simulations
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

This guide should help you effectively operate and monitor your BotSight database.