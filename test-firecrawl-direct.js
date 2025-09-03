// Direct test of FireCrawl integration
import FirecrawlApp from '@mendable/firecrawl-js';

// Set the API key directly
const firecrawl = new FirecrawlApp({ apiKey: 'fc-04ba59e41aeb4138b53e0ace5d573e00' });

async function testFireCrawl() {
  console.log('Testing FireCrawl integration...');
  console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(firecrawl)));
  
  try {
    console.log('Attempting to scrape https://fundvault.in');
    // Try different method names
    if (typeof firecrawl.scrapeUrl === 'function') {
      const response = await firecrawl.scrapeUrl('https://fundvault.in', {
        formats: ['markdown', 'html']
      });
      console.log('FireCrawl response:', JSON.stringify(response, null, 2));
    } else if (typeof firecrawl.crawlUrl === 'function') {
      const response = await firecrawl.crawlUrl('https://fundvault.in');
      console.log('FireCrawl response:', JSON.stringify(response, null, 2));
    } else if (typeof firecrawl.scrape === 'function') {
      const response = await firecrawl.scrape('https://fundvault.in', {
        formats: ['markdown', 'html']
      });
      console.log('FireCrawl response:', JSON.stringify(response, null, 2));
    } else {
      console.log('No suitable scraping method found');
    }
  } catch (error) {
    console.error('FireCrawl error:', error.message);
    console.error('Error details:', error);
  }
}

testFireCrawl();