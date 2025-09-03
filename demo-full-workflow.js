/**
 * Demo script for the complete BotSight workflow
 * This script demonstrates:
 * 1. How to use the snippet on a webpage
 * 2. How telemetry data is sent to the server
 * 3. How to enqueue a simulation job
 * 4. How to run a simulation worker
 */

console.log('BotSight Full Workflow Demo');
console.log('==========================');

console.log('\n1. Client-side snippet usage:');
console.log('   Add this to your HTML page:');
console.log('   <script src="https://cdn.botsight.ai/botsight.iife.js" data-site-id="demo-site" async></script>');

console.log('\n2. Telemetry data captured by snippet:');
const telemetryData = {
  siteId: 'demo-site',
  url: 'https://example.com/page',
  ua: 'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
  extractedSummary: {
    hasJsonLd: true,
    og: {
      'og:title': 'Example Page',
      'og:description': 'This is an example page'
    },
    title: 'Example Page',
    h1Count: 1
  },
  llmsTxt: null,
  ts: new Date().toISOString()
};

console.log(JSON.stringify(telemetryData, null, 2));

console.log('\n3. Server-side telemetry endpoint receives data and:');
console.log('   - Matches user agent to known agents');
console.log('   - Stores visit data in the visits table');
console.log('   - Extracts fields into extracted_fields table');
console.log('   - Tracks unknown agents in unknown_agent_candidates table');

console.log('\n4. To enqueue a simulation job:');
console.log('   POST /v1/simulate');
console.log('   Body:');
const simulateRequest = {
  siteId: 'demo-site',
  url: 'https://example.com/page',
  agentName: 'GPTBot'
};
console.log(JSON.stringify(simulateRequest, null, 2));

console.log('\n5. Simulation worker processes the job by:');
console.log('   - Launching a browser with the agent\'s user agent');
console.log('   - Navigating to the URL');
console.log('   - Extracting structured data (JSON-LD, meta tags, etc.)');
console.log('   - Taking a screenshot');
console.log('   - Storing results in the simulations table');

console.log('\n6. Agent sync job:');
console.log('   - Fetches agents.json from a remote URL');
console.log('   - Upserts agent data into the agents table');
console.log('   - Keeps the agent database up to date');

console.log('\nThis completes the full BotSight workflow!');