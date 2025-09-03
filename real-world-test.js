// Test BotSight with real websites
import { crawlPage, validateScrape, extractStructuredData, generateSnippet } from './packages/botsight-core/dist/index.js';
import fs from 'fs';

// List of real websites to test
const testSites = [
  {
    name: "GitHub",
    url: "https://github.com"
  },
  {
    name: "MDN Web Docs",
    url: "https://developer.mozilla.org/en-US/"
  },
  {
    name: "Wikipedia",
    url: "https://en.wikipedia.org/wiki/Main_Page"
  }
];

async function testWebsite(site) {
  console.log(`\n🔍 Testing ${site.name}: ${site.url}`);
  console.log('='.repeat(50));
  
  try {
    // Crawl the page
    console.log('🕷️  Crawling page...');
    const scrapeResult = await crawlPage(site.url);
    
    // Validate the scrape
    console.log('✅ Validating scrape...');
    const validationResult = validateScrape(
      site.url,
      scrapeResult.staticHtml,
      scrapeResult.dynamicHtml
    );
    
    // Extract structured data
    console.log('📊 Extracting structured data...');
    const htmlToUse = scrapeResult.dynamicHtml || scrapeResult.staticHtml;
    const structuredData = extractStructuredData(htmlToUse);
    
    // Generate snippet
    console.log('🔧 Generating snippet...');
    const snippet = generateSnippet(structuredData, {
      agentAPI: `${site.url}/api/agents`
    });
    
    // Display results
    console.log('\n📈 Validation Report:');
    console.log(`  Confidence Score: ${validationResult.confidence.toFixed(2)}`);
    console.log(`  Static Size: ${validationResult.staticSize} bytes`);
    if (validationResult.dynamicSize) {
      console.log(`  Dynamic Size: ${validationResult.dynamicSize} bytes`);
    }
    
    if (validationResult.missingElements.length > 0) {
      console.log('\n⚠️  Missing Elements:');
      validationResult.missingElements.forEach(element => {
        console.log(`    - ${element}`);
      });
    } else {
      console.log('\n✅ All essential elements present!');
    }
    
    // Show some extracted data
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
    
    // Save results to files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = `test-results/${site.name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
    fs.mkdirSync(outputDir, { recursive: true });
    
    fs.writeFileSync(`${outputDir}/validation.json`, JSON.stringify(validationResult, null, 2));
    fs.writeFileSync(`${outputDir}/data.json`, JSON.stringify(structuredData, null, 2));
    fs.writeFileSync(`${outputDir}/snippet.html`, snippet.html);
    fs.writeFileSync(`${outputDir}/static-content.html`, scrapeResult.staticHtml);
    if (scrapeResult.dynamicHtml) {
      fs.writeFileSync(`${outputDir}/dynamic-content.html`, scrapeResult.dynamicHtml);
    }
    
    console.log(`\n💾 Results saved to: ${outputDir}`);
    
    return {
      site: site.name,
      url: site.url,
      confidence: validationResult.confidence,
      staticSize: validationResult.staticSize,
      dynamicSize: validationResult.dynamicSize
    };
  } catch (error) {
    console.error(`❌ Error testing ${site.name}:`, error.message);
    return {
      site: site.name,
      url: site.url,
      error: error.message
    };
  }
}

async function runAllTests() {
  console.log('🚀 Starting BotSight Real-World Tests');
  console.log('=====================================');
  
  const results = [];
  
  for (const site of testSites) {
    const result = await testWebsite(site);
    results.push(result);
  }
  
  // Summary
  console.log('\n📋 TEST SUMMARY');
  console.log('===============');
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.site}: ERROR - ${result.error}`);
    } else {
      console.log(`✅ ${result.site}: Confidence ${result.confidence.toFixed(2)} (${result.staticSize} bytes static)`);
    }
  });
}

// Run the tests
runAllTests().catch(console.error);