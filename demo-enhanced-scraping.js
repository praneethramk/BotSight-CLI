#!/usr/bin/env node

/**
 * Demo script for enhanced scraping with FireCrawl integration
 * Usage: node demo-enhanced-scraping.js <url>
 */

import { crawlPageEnhanced, extractStructuredData, generateEnhancedSnippet } from './packages/botsight-core/dist/index.js';
import fs from 'fs';

async function demoEnhancedScraping(url) {
  console.log(`🔍 BotSight Enhanced Scraping Demo`);
  console.log(`Target URL: ${url}`);
  console.log('='.repeat(50));
  
  try {
    // Check if FireCrawl API key is available
    const hasApiKey = !!process.env.FIRECRAWL_API_KEY;
    if (!hasApiKey) {
      console.log('⚠️  Warning: FIRECRAWL_API_KEY not set');
      console.log('   Enhanced scraping will fall back to traditional methods');
    }
    
    // Crawl the page with enhanced extraction
    console.log('🕷️  Crawling page with enhanced extraction...');
    const scrapeResult = await crawlPageEnhanced(url, process.env.FIRECRAWL_API_KEY);
    
    // Extract structured data
    console.log('📊 Extracting structured data...');
    const htmlToUse = scrapeResult.dynamicHtml || scrapeResult.staticHtml;
    const structuredData = extractStructuredData(htmlToUse, scrapeResult.firecrawlData);
    
    // Generate enhanced snippet
    console.log('🔧 Generating enhanced snippet...');
    const snippet = generateEnhancedSnippet(structuredData, scrapeResult.firecrawlData, {
      agentAPI: `${url}/api/agents`,
      siteName: new URL(url).hostname
    });
    
    // Display results
    console.log('\n📦 Extracted Data:');
    console.log(`  Title: ${structuredData.title || 'N/A'}`);
    console.log(`  Description: ${structuredData.description ? structuredData.description.substring(0, 80) + '...' : 'N/A'}`);
    console.log(`  H1 Headings: ${structuredData.headings?.h1?.length || 0}`);
    console.log(`  H2 Headings: ${structuredData.headings?.h2?.length || 0}`);
    console.log(`  CTAs Found: ${structuredData.ctas?.length || 0}`);
    
    if (scrapeResult.firecrawlData) {
      console.log('\n🔥 FireCrawl Data:');
      console.log(`  Success: ${scrapeResult.firecrawlData.success}`);
      console.log(`  Content Length: ${scrapeResult.firecrawlData.markdown?.length || 0} characters`);
    }
    
    // Show confidence indicators
    console.log('\n📈 Confidence Indicators:');
    const indicators = snippet.json.botsight?.confidenceIndicators || {};
    Object.entries(indicators).forEach(([key, value]) => {
      console.log(`  ${key}: ${value ? '✅' : '❌'}`);
    });
    
    // Save snippet to file
    const outputFile = 'botsight-enhanced-snippet.html';
    fs.writeFileSync(outputFile, snippet.html);
    console.log(`\n💾 Enhanced snippet saved to: ${outputFile}`);
    
    // Show snippet preview
    console.log('\n📋 Generated Enhanced Snippet Preview:');
    console.log(snippet.html);
    
    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

// Get URL from command line arguments
const url = process.argv[2];

if (!url) {
  console.log('Usage: node demo-enhanced-scraping.js <url>');
  console.log('Example: node demo-enhanced-scraping.js https://fundvault.in');
  process.exit(1);
}

// Run the demo
demoEnhancedScraping(url).then(success => {
  console.log('\n🏁 Demo Completed');
  process.exit(success ? 0 : 1);
});