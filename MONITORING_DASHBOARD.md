# Monitoring Dashboard Setup

This guide explains how to set up a simple monitoring dashboard for your BotSight system.

## Option 1: Using Grafana (Recommended)

### Installation

1. Install Grafana:
   ```bash
   # For Ubuntu/Debian
   sudo apt-get install -y apt-transport-https
   sudo apt-get install -y software-properties-common wget
   wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
   echo "deb https://packages.grafana.com/oss/deb stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list
   sudo apt-get update
   sudo apt-get install grafana
   
   # Start Grafana
   sudo systemctl start grafana-server
   ```

### PostgreSQL Data Source Setup

1. Access Grafana at `http://localhost:3000` (default login: admin/admin)
2. Go to Configuration > Data Sources
3. Add a new PostgreSQL data source with these settings:
   - Name: BotSight DB
   - Host: your-db-host:5432
   - Database: botsight_db
   - User: botsight
   - Password: your_secure_password
   - SSL Mode: disable

### Dashboard Panels

Create a new dashboard with these panels:

#### Panel 1: Total Visits Over Time
```sql
SELECT 
    time,
    visits
FROM (
    SELECT 
        date_trunc('hour', created_at) AS time,
        count(*) AS visits
    FROM visits
    WHERE site_id = '$site_id'
        AND created_at > $__timeFrom() 
        AND created_at < $__timeTo()
    GROUP BY time
    ORDER BY time
) AS sub
```

#### Panel 2: Visits by Agent
```sql
SELECT 
    a.name AS agent,
    count(*) AS visits
FROM visits v
JOIN agents a ON v.agent_id = a.id
WHERE v.site_id = '$site_id'
    AND v.created_at > $__timeFrom() 
    AND v.created_at < $__timeTo()
GROUP BY a.name
ORDER BY visits DESC
```

#### Panel 3: JSON-LD Coverage
```sql
SELECT 
    CASE 
        WHEN extracted_summary->>'hasJsonLd' = 'true' THEN 'With JSON-LD'
        ELSE 'Without JSON-LD'
    END AS jsonld_status,
    count(*) AS count
FROM visits
WHERE site_id = '$site_id'
    AND created_at > $__timeFrom() 
    AND created_at < $__timeTo()
GROUP BY jsonld_status
```

#### Panel 4: Top Extracted Fields
```sql
SELECT 
    field_name,
    count(*) AS occurrences
FROM extracted_fields ef
JOIN visits v ON ef.visit_id = v.id
WHERE v.site_id = '$site_id'
    AND v.created_at > $__timeFrom() 
    AND v.created_at < $__timeTo()
GROUP BY field_name
ORDER BY occurrences DESC
LIMIT 10
```

## Option 2: Simple Web Dashboard

Create a simple dashboard using the existing server:

### 1. Create a Dashboard Route

Add this to `server/src/routes/dashboard.ts`:

```typescript
import { FastifyInstance } from 'fastify';
import { query } from '../db';

export default async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.get('/dashboard', async (request, reply) => {
    // Get recent visits
    const visitsRes = await query(`
      SELECT 
        v.id,
        v.url,
        a.name AS agent_name,
        v.timestamp,
        v.extracted_summary->>'hasJsonLd' AS has_jsonld
      FROM visits v
      LEFT JOIN agents a ON v.agent_id = a.id
      WHERE v.site_id = $1
      ORDER BY v.created_at DESC
      LIMIT 20
    `, ['your-site-id']);

    // Get agent statistics
    const agentStatsRes = await query(`
      SELECT 
        a.name AS agent_name,
        COUNT(v.id) AS visit_count
      FROM visits v
      JOIN agents a ON v.agent_id = a.id
      WHERE v.site_id = $1
      GROUP BY a.name
      ORDER BY visit_count DESC
    `, ['your-site-id']);

    return reply.view('/dashboard.ejs', {
      visits: visitsRes.rows,
      agentStats: agentStatsRes.rows
    });
  });
}
```

### 2. Create a Dashboard Template

Create `server/src/views/dashboard.ejs`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>BotSight Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .jsonld-yes { color: green; }
        .jsonld-no { color: red; }
    </style>
</head>
<body>
    <h1>BotSight Dashboard</h1>
    
    <h2>Recent Visits</h2>
    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>URL</th>
                <th>Agent</th>
                <th>Time</th>
                <th>JSON-LD</th>
            </tr>
        </thead>
        <tbody>
            <% visits.forEach(visit => { %>
            <tr>
                <td><%= visit.id %></td>
                <td><%= visit.url %></td>
                <td><%= visit.agent_name || 'Unknown' %></td>
                <td><%= new Date(visit.timestamp).toLocaleString() %></td>
                <td class="<%= visit.has_jsonld === 'true' ? 'jsonld-yes' : 'jsonld-no' %>">
                    <%= visit.has_jsonld === 'true' ? 'Yes' : 'No' %>
                </td>
            </tr>
            <% }); %>
        </tbody>
    </table>
    
    <h2>Agent Statistics</h2>
    <table>
        <thead>
            <tr>
                <th>Agent</th>
                <th>Visits</th>
            </tr>
        </thead>
        <tbody>
            <% agentStats.forEach(stat => { %>
            <tr>
                <td><%= stat.agent_name %></td>
                <td><%= stat.visit_count %></td>
            </tr>
            <% }); %>
        </tbody>
    </table>
</body>
</html>
```

### 3. Update Server to Serve Dashboard

Update `server/src/index.ts`:

```typescript
import fastify from 'fastify';
import fastifyView from '@fastify/view';
import ejs from 'ejs';
import telemetryRoutes from './routes/telemetry';
import configRoutes from './routes/config';
import simulateRoutes from './routes/simulate';
import dashboardRoutes from './routes/dashboard';
import { scheduleAgentSync } from './jobs/agentSyncJob';

const app = fastify({ logger: true });

// Register view engine for dashboard
app.register(fastifyView, {
  engine: {
    ejs: ejs
  },
  templates: './src/views'
});

// Register routes
app.register(telemetryRoutes);
app.register(configRoutes);
app.register(simulateRoutes);
app.register(dashboardRoutes);

// Schedule agent sync job
scheduleAgentSync();

const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || 'localhost';

app.listen({ port, host }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
  console.log(`Dashboard available at ${address}/dashboard`);
});
```

### 4. Install Required Dependencies

```bash
cd server
npm install @fastify/view ejs
```

Now you can access your dashboard at `http://your-server:3000/dashboard`.

## Option 3: Database-Only Monitoring

If you prefer to monitor directly through database queries, refer to the [DATABASE_OPERATIONS.md](DATABASE_OPERATIONS.md) file for useful queries.

You can also set up automated reports by creating a script that runs these queries periodically and emails the results.