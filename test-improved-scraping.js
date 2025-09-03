// Test BotSight with improved scraping approach
import { crawlPage, validateScrape, extractStructuredData, generateSnippet } from './packages/botsight-core/dist/index.js';
import fs from 'fs';

// Improved crawler with better error handling
async function improvedCrawl(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1}/${retries}...`);
      return await crawlPage(url);
    } catch (error) {
      console.log(`Attempt ${i + 1} failed: ${error.message}`);
      if (i < retries - 1) {
        console.log('Retrying in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        throw error;
      }
    }
  }
}

async function testWebsite(name, url) {
  console.log(`\n🔍 Testing ${name}: ${url}`);
  console.log('='.repeat(50));
  
  try {
    // Crawl the page with retries
    console.log('🕷️  Crawling page...');
    const scrapeResult = await improvedCrawl(url);
    
    // Validate the scrape
    console.log('✅ Validating scrape...');
    const validationResult = validateScrape(
      url,
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
      agentAPI: `${url}/api/agents`
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
      console.log(`  Title: ${structuredData.title.substring(0, 60)}${structuredData.title.length > 60 ? '...' : ''}`);
    }
    if (structuredData.description) {
      console.log(`  Description: ${structuredData.description.substring(0, 100)}...`);
    }
    if (structuredData.schemaLd) {
      console.log(`  Schema Type: ${structuredData.schemaLd['@type'] || 'N/A'}`);
    }
    if (structuredData.opengraph) {
      console.log(`  OG Title: ${structuredData.opengraph.title ? structuredData.opengraph.title.substring(0, 60) + '...' : 'N/A'}`);
    }
    
    // Show CTAs if any
    if (structuredData.ctas && structuredData.ctas.length > 0) {
      console.log('\n📍 Primary CTAs:');
      structuredData.ctas.slice(0, 3).forEach(cta => {
        console.log(`  - ${cta.text}: ${cta.url}`);
      });
    }
    
    // Save results to files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = `test-results/${name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
    fs.mkdirSync(outputDir, { recursive: true });
    
    fs.writeFileSync(`${outputDir}/validation.json`, JSON.stringify(validationResult, null, 2));
    fs.writeFileSync(`${outputDir}/data.json`, JSON.stringify(structuredData, null, 2));
    fs.writeFileSync(`${outputDir}/snippet.html`, snippet.html);
    fs.writeFileSync(`${outputDir}/static-content.html`, scrapeResult.staticHtml.substring(0, 10000) + '... (truncated)');
    if (scrapeResult.dynamicHtml) {
      fs.writeFileSync(`${outputDir}/dynamic-content.html`, scrapeResult.dynamicHtml.substring(0, 10000) + '... (truncated)');
    }
    
    console.log(`\n💾 Results saved to: ${outputDir}`);
    
    // Show snippet preview
    console.log('\n📋 Generated Snippet Preview:');
    console.log(snippet.html.substring(0, 500) + (snippet.html.length > 500 ? '...' : ''));
    
    return {
      name,
      url,
      confidence: validationResult.confidence,
      staticSize: validationResult.staticSize,
      dynamicSize: validationResult.dynamicSize,
      error: null
    };
  } catch (error) {
    console.error(`❌ Error testing ${name}:`, error.message);
    return {
      name,
      url,
      error: error.message
    };
  }
}

// List of more accessible websites to test
const testSites = [
  {
    name: "Node.js Official",
    url: "https://nodejs.org/en/"
  },
  {
    name: "GitHub",
    url: "https://github.com/"
  },
  {
    name: "MDN Web Docs",
    url: "https://developer.mozilla.org/en-US/"
  }
];

async function runAllTests() {
  console.log('🚀 Starting BotSight Improved Scraping Tests');
  console.log('==========================================');
  
  const results = [];
  
  for (const site of testSites) {
    const result = await testWebsite(site.name, site.url);
    results.push(result);
    
    // Add a delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Summary
  console.log('\n📋 TEST SUMMARY');
  console.log('===============');
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.name}: ERROR - ${result.error.substring(0, 50)}...`);
    } else {
      console.log(`✅ ${result.name}: Confidence ${result.confidence.toFixed(2)} (${result.staticSize} bytes static)`);
    }
  });
}

// Run the tests
runAllTests().catch(console.error);