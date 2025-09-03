# BotSight Usage Guide

## Overview

BotSight is a tool that makes websites agentic-browser friendly by:
1. Crawling webpages (static and dynamic)
2. Validating the completeness of scraped content
3. Extracting structured data (JSON-LD, OpenGraph, etc.)
4. Generating agent-readable snippets
5. Providing an npm package for easy integration

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd botsight

# Install dependencies
npm install

# Build all packages
npm run build
```

## CLI Usage

The BotSight CLI provides several commands for analyzing websites:

### Initialize Configuration
```bash
botsight init
```
Creates a `botsight.config.json` file with default settings.

### Crawl a Website
```bash
botsight crawl <url>
```
Crawls a website, validates the content, extracts structured data, and generates a snippet.

Options:
- `-o, --output <dir>`: Output directory (default: './botsight-output')
- `--simulate`: Simulate agent visit

### Validate a Website
```bash
botsight validate <url>
```
Validates a website scrape and provides a confidence score.

### Generate Snippet from Data
```bash
botsight generate <data.json>
```
Generates a BotSight snippet from pre-supplied JSON data.

Options:
- `-o, --output <file>`: Output file for snippet (default: './botsight-snippet.html')

## NPM Package Usage

To integrate BotSight into your website:

```bash
npm install botsight-snippet
```

```javascript
import { injectBotSight } from "botsight-snippet";

injectBotSight({
  name: "Your Site Name",
  url: "https://yoursite.com",
  description: "Your site description",
  offers: [...], // Optional
  faqs: [...]    // Optional
});
```

Add this to the top of your `<head>` section to make your site immediately readable by AI agents.

## Core Package Usage

For programmatic access to BotSight functionality:

```javascript
import { crawlPage, validateScrape, extractStructuredData, generateSnippet } from 'botsight-core';

// Crawl a page
const scrapeResult = await crawlPage('https://example.com');

// Validate the scrape
const validationResult = validateScrape(
  'https://example.com',
  scrapeResult.staticHtml,
  scrapeResult.dynamicHtml
);

// Extract structured data
const structuredData = extractStructuredData(scrapeResult.dynamicHtml || scrapeResult.staticHtml);

// Generate snippet
const snippet = generateSnippet(structuredData, {
  agentAPI: 'https://example.com/api/agents'
});
```

## Output Files

When using the `crawl` command, BotSight generates several files:

1. `*-validation.json` - Validation report with confidence score
2. `*-data.json` - Extracted structured data
3. `*-snippet.html` - HTML snippet for agent consumption
4. `*-snippet.json` - JSON representation of the snippet

## Example Output

### Validation Report
```json
{
  "confidence": 0.92,
  "missingElements": ["faqSchema", "openGraph:image"],
  "staticSize": 24000,
  "dynamicSize": 260000
}
```

### Structured Data
```json
{
  "title": "Example Site",
  "description": "This is an example website",
  "canonical": "https://example.com/",
  "opengraph": {
    "title": "Example Site",
    "description": "This is an example website",
    "image": "https://example.com/image.jpg"
  },
  "schemaLd": {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Example Site",
    "url": "https://example.com/"
  }
}
```

### Generated Snippet
```html
<script type="application/ld+json" id="botsight-schema">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Example Site",
  "url": "https://example.com/",
  "agentAPI": "https://example.com/api/agents"
}
</script>
```