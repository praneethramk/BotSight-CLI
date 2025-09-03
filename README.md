# BotSight

A codebase that enables websites to be **agentic-browser friendly**. BotSight crawls a webpage, validates the scrape, extracts structured data, generates metadata/snippets, and ships it as an npm module/snippet that site owners can embed. The goal is to make pages visible and actionable for AI agents and LLM crawlers.

## 📦 Packages

This monorepo contains the following packages:

### `botsight-core`
Core scraping, validation, and extraction logic with FireCrawl integration for enhanced data extraction.

### `botsight-cli`
CLI tool to run BotSight locally.

### `botsight-npm`
Reusable npm package snippet for websites.

### `botsight-dashboard`
(Planned) Analytics and simulation dashboard.

### `botsight-server`
Backend server with telemetry, configuration, and simulation endpoints.

### `botsight-snippet`
Client-side snippet for easy website integration.

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16
- pnpm
- PostgreSQL database
- Redis server

### Installation
```bash
pnpm install
```

### Build
```bash
pnpm build
```

## 🛠️ Usage

### CLI
```bash
# Initialize configuration
botsight init

# Crawl a website
botsight crawl https://example.com

# Validate a website
botsight validate https://example.com

# Generate snippet from JSON data
botsight generate data.json
```

### NPM Package
```bash
npm install botsight-snippet
```

```javascript
import { injectBotSight } from "botsight-snippet";

injectBotSight({
  name: "Client Site",
  url: "https://client.com",
  offers: [...]
});
```

### Server
```bash
# Navigate to server directory
cd server

# Set environment variables
export DATABASE_URL=postgresql://user:password@localhost:5432/botsight_db
export REDIS_URL=redis://localhost:6379

# Run database migrations
npm run migrate

# Seed initial data
npm run seed

# Start the server
npm start

# In separate terminals, start worker and agent sync
npm run worker
npm run sync-agents
```

### Client-side Snippet
Add this to your website's HTML:
```html
<script 
    src="https://your-server.com/botsight.iife.js" 
    data-site-id="your-site-id" 
    async>
</script>
```

## 🏗️ Architecture

```
├── botsight-core/          # Core logic with FireCrawl integration
│   ├── crawler.ts          # Page crawling (static + dynamic + FireCrawl)
│   ├── validator.ts        # Scrape validation
│   ├── extractor.ts        # Structured data extraction
│   └── snippet-generator.ts # Snippet generation
├── botsight-cli/           # CLI interface
│   └── cli.ts              # Command definitions
├── botsight-npm/           # Embeddable snippet
│   └── index.ts            # Browser-compatible JS
├── botsight-server/        # Backend server
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── workers/        # Playwright simulation worker
│   │   ├── jobs/           # Agent sync job
│   │   └── db/             # Database connection
│   └── db/ddl/             # Database schema
├── botsight-snippet/       # Client-side snippet
│   └── src/
└── botsight-dashboard/     # (Future) Analytics dashboard
```

## 🎯 Features

- **Enhanced Page Crawling**: Static + dynamic rendering with Playwright and FireCrawl integration
- **Scrape Validation**: Confidence scoring and missing element detection
- **Structured Data Extraction**: JSON-LD, OpenGraph, Twitter Cards, etc.
- **Snippet Generation**: Agent-readable structured data with BotSight-specific metadata
- **NPM Package**: One-line integration for site owners
- **CLI Tool**: Easy local testing and onboarding
- **Auto Agent Detection**: Automatically detect new AI agents via user-agent database
- **Site-owner Analytics**: Track which agents visited and what they extracted
- **Dashboard Simulation**: See how GPT/Perplexity and other agents view your page
- **Production Ready**: Security, privacy, and performance optimized

## 📈 Backend Features

### Telemetry Endpoint
- `POST /v1/telemetry` - Accepts telemetry data from client snippets
- Automatically matches user agents to known AI agents
- Stores visit data and extracted fields for analytics

### Configuration Endpoint
- `GET /v1/config/:siteId` - Returns site configuration for snippets

### Simulation Endpoint
- `POST /v1/simulate` - Enqueues Playwright jobs to simulate how agents see pages
- Captures JSON-LD, meta tags, content, and screenshots

### Agent Management
- Automatic sync with remote agents database
- Unknown agent detection and candidate review system

## 📊 Analytics & Monitoring

- Comprehensive database schema for tracking visits, agents, and extracted data
- Example SQL queries for insights and reporting
- Dashboard options for real-time monitoring
- Performance and security optimized

## 📄 Documentation

- [Quick Start Guide](QUICK_START.md) - Get up and running in under 30 minutes
- [Setup Guide](SETUP_GUIDE.md) - Detailed deployment instructions
- [Database Setup](DB_SETUP.md) - Database configuration and initialization
- [Database Operations](DATABASE_OPERATIONS.md) - Monitoring and analysis queries
- [Monitoring Dashboard](MONITORING_DASHBOARD.md) - Dashboard setup options
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions

## 📄 License

MIT