// Set FireCrawl API key
const FIRECRAWL_API_KEY = 'fc-04ba59e41aeb4138b53e0ace5d573e00';

// Test enhanced scraping with FireCrawl integration on fundvault.in
import { crawlPageEnhanced, extractStructuredData, generateEnhancedSnippet } from './packages/botsight-core/dist/index.js';
import fs from 'fs';

async function testFundVaultEnhanced() {
  const url = 'https://fundvault.in';
  console.log(`🔍 Testing enhanced scraping for: ${url}`);
  console.log('='.repeat(50));
  
  try {
    // Crawl the page with enhanced extraction
    console.log('🕷️  Crawling page with enhanced extraction...');
    const scrapeResult = await crawlPageEnhanced(url, FIRECRAWL_API_KEY);
    
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
    console.log('\n📦 Extracted Data Sample:');
    if (structuredData.title) {
      console.log(`  Title: ${structuredData.title}`);
    }
    if (structuredData.description) {
      console.log(`  Description: ${structuredData.description.substring(0, 100)}...`);
    }
    if (structuredData.schemaLd) {
      console.log(`  Schema Type: ${structuredData.schemaLd['@type'] || 'N/A'}`);
    }
    if (structuredData.opengraph) {
      console.log(`  OG Title: ${structuredData.opengraph.title || 'N/A'}`);
    }
    
    // Show FireCrawl data if available
    if (scrapeResult.firecrawlData) {
      console.log('\n🔥 FireCrawl Data:');
      console.log(`  Success: ${scrapeResult.firecrawlData.success}`);
      console.log(`  Markdown length: ${scrapeResult.firecrawlData.markdown?.length || 0} characters`);
      console.log(`  Links found: ${scrapeResult.firecrawlData.links?.length || 0}`);
      
      if (scrapeResult.firecrawlData.extract) {
        console.log('  Extracted metadata:');
        if (scrapeResult.firecrawlData.extract.metadata) {
          console.log(`    Title: ${scrapeResult.firecrawlData.extract.metadata.title || 'N/A'}`);
          console.log(`    Description: ${scrapeResult.firecrawlData.extract.metadata.description?.substring(0, 50) || 'N/A'}...`);
        }
      }
    } else {
      console.log('\n⚠️  No FireCrawl data available');
    }
    
    // Save results to files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const hostname = new URL(url).hostname.replace(/\./g, '-');
    const outputDir = `test-results/${hostname}-enhanced-${timestamp}`;
    fs.mkdirSync(outputDir, { recursive: true });
    
    fs.writeFileSync(`${outputDir}/data.json`, JSON.stringify(structuredData, null, 2));
    fs.writeFileSync(`${outputDir}/snippet.html`, snippet.html);
    fs.writeFileSync(`${outputDir}/snippet.json`, JSON.stringify(snippet.json, null, 2));
    
    if (scrapeResult.firecrawlData) {
      fs.writeFileSync(`${outputDir}/firecrawl.json`, JSON.stringify(scrapeResult.firecrawlData, null, 2));
    }
    
    console.log(`\n💾 Results saved to: ${outputDir}`);
    
    // Show snippet preview
    console.log('\n📋 Generated Enhanced Snippet Preview:');
    console.log(snippet.html);
    
    // Show confidence indicators
    if (snippet.json.botsight?.confidenceIndicators) {
      console.log('\n📈 Confidence Indicators:');
      const indicators = snippet.json.botsight.confidenceIndicators;
      Object.entries(indicators).forEach(([key, value]) => {
        console.log(`  ${key}: ${value ? '✅' : '❌'}`);
      });
    }
    
    return {
      url,
      success: true,
      error: null
    };
  } catch (error) {
    console.error(`❌ Error testing ${url}:`, error.message);
    return {
      url,
      success: false,
      error: error.message
    };
  }
}

// Run the test
testFundVaultEnhanced().then(result => {
  console.log('\n🏁 Enhanced Scraping Test Completed');
  console.log('====================================');
  if (result.success) {
    console.log(`✅ Success: Enhanced scraping completed for ${result.url}`);
  } else {
    console.log(`❌ Failed: ${result.error}`);
  }
}).catch(console.error);