// Test FireCrawl integration in the core package
const FIRECRAWL_API_KEY = 'fc-04ba59e41aeb4138b53e0ace5d573e00';

import { crawlPageWithFireCrawl } from './packages/botsight-core/dist/crawler.js';

async function testCoreFireCrawl() {
  console.log('Testing FireCrawl integration in core package...');
  
  try {
    console.log('Attempting to scrape https://fundvault.in');
    const response = await crawlPageWithFireCrawl('https://fundvault.in', FIRECRAWL_API_KEY);
    console.log('FireCrawl response:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('FireCrawl error:', error.message);
    console.error('Error details:', error);
  }
}

testCoreFireCrawl();