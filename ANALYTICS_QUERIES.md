# BotSight Analytics Queries

This document provides example SQL queries to extract insights from the BotSight data.

## Top Agents by Visit Count

```sql
SELECT 
    a.name AS agent_name,
    COUNT(v.id) AS visit_count
FROM visits v
JOIN agents a ON v.agent_id = a.id
GROUP BY a.name
ORDER BY visit_count DESC;
```

## JSON-LD Coverage by Agent

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
GROUP BY a.name
ORDER BY jsonld_coverage_pct DESC;
```

## Unknown Agents (Candidates for Review)

```sql
SELECT 
    ua,
    sample_site,
    count,
    first_seen,
    last_seen
FROM unknown_agent_candidates
ORDER BY count DESC, last_seen DESC;
```

## Site Visit Trends Over Time

```sql
SELECT 
    site_id,
    DATE_TRUNC('day', created_at) AS day,
    COUNT(*) AS visit_count
FROM visits
GROUP BY site_id, DATE_TRUNC('day', created_at)
ORDER BY day DESC, site_id;
```

## Top Extracted Fields

```sql
SELECT 
    field_name,
    COUNT(*) AS occurrence_count,
    COUNT(DISTINCT visit_id) AS unique_visits
FROM extracted_fields
GROUP BY field_name
ORDER BY occurrence_count DESC
LIMIT 20;
```

## Simulation Success Rate

```sql
SELECT 
    agent_name,
    COUNT(CASE WHEN status = 'done' THEN 1 END) AS successful_simulations,
    COUNT(*) AS total_simulations,
    ROUND(
        COUNT(CASE WHEN status = 'done' THEN 1 END) * 100.0 / COUNT(*), 
        2
    ) AS success_rate_pct
FROM simulations
GROUP BY agent_name
ORDER BY success_rate_pct DESC;
```

## Sites with Highest Agent Diversity

```sql
SELECT 
    site_id,
    COUNT(DISTINCT agent_id) AS unique_agents
FROM visits
WHERE agent_id IS NOT NULL
GROUP BY site_id
ORDER BY unique_agents DESC;
```

## Recent Simulations with Results

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
WHERE status = 'done'
ORDER BY finished_at DESC
LIMIT 10;
```

## Agent Detection Accuracy

```sql
SELECT 
    COUNT(CASE WHEN agent_id IS NOT NULL THEN 1 END) AS detected_visits,
    COUNT(CASE WHEN agent_id IS NULL AND ua IS NOT NULL THEN 1 END) AS undetected_visits,
    COUNT(*) AS total_visits,
    ROUND(
        COUNT(CASE WHEN agent_id IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 
        2
    ) AS detection_rate_pct
FROM visits;
```

These queries can be used to monitor the system, understand agent behavior, and optimize the snippet and detection algorithms.