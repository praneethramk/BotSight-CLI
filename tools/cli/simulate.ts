#!/usr/bin/env node

import axios from 'axios';

async function simulateCrawl() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: botsight-simulate <siteId> <url> <agentName>');
    console.log('Example: botsight-simulate demo-site https://example.com GPTBot');
    process.exit(1);
  }
  
  const [siteId, url, agentName] = args;
  
  try {
    const response = await axios.post('http://localhost:3000/v1/simulate', {
      siteId,
      url,
      agentName
    });
    
    console.log('Simulation job queued successfully:');
    console.log(`Job ID: ${response.data.jobId}`);
  } catch (error) {
    console.error('Error queuing simulation job:', error);
    process.exit(1);
  }
}

simulateCrawl();