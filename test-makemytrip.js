// Test BotSight with MakeMyTrip website
import { crawlPage, validateScrape, extractStructuredData, generateSnippet } from './packages/botsight-core/dist/index.js';
import fs from 'fs';

async function testMakeMyTrip() {
  const url = "https://www.makemytrip.com/";
  console.log(`🔍 Testing MakeMyTrip: ${url}`);
  console.log('='.repeat(50));
  
  try {
    // Crawl the page
    console.log('🕷️  Crawling page...');
    const scrapeResult = await crawlPage(url);
    
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
    
    // Show CTAs if any
    if (structuredData.ctas && structuredData.ctas.length > 0) {
      console.log('\n📍 Primary CTAs:');
      structuredData.ctas.slice(0, 3).forEach(cta => {
        console.log(`  - ${cta.text}: ${cta.url}`);
      });
    }
    
    // Save results to files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = `test-results/makemytrip-${timestamp}`;
    fs.mkdirSync(outputDir, { recursive: true });
    
    fs.writeFileSync(`${outputDir}/validation.json`, JSON.stringify(validationResult, null, 2));
    fs.writeFileSync(`${outputDir}/data.json`, JSON.stringify(structuredData, null, 2));
    fs.writeFileSync(`${outputDir}/snippet.html`, snippet.html);
    fs.writeFileSync(`${outputDir}/static-content.html`, scrapeResult.staticHtml);
    if (scrapeResult.dynamicHtml) {
      fs.writeFileSync(`${outputDir}/dynamic-content.html`, scrapeResult.dynamicHtml);
    }
    
    console.log(`\n💾 Results saved to: ${outputDir}`);
    
    // Show snippet preview
    console.log('\n📋 Generated Snippet Preview:');
    console.log(snippet.html);
    
    return {
      url,
      confidence: validationResult.confidence,
      staticSize: validationResult.staticSize,
      dynamicSize: validationResult.dynamicSize,
      error: null
    };
  } catch (error) {
    console.error(`❌ Error testing MakeMyTrip:`, error.message);
    return {
      url,
      error: error.message
    };
  }
}

// Run the test
testMakeMyTrip().then(result => {
  console.log('\n🏁 Test Completed');
  console.log('=================');
  if (result.error) {
    console.log(`❌ Failed: ${result.error}`);
  } else {
    console.log(`✅ Success: Confidence ${result.confidence.toFixed(2)} (${result.staticSize} bytes static)`);
  }
}).catch(console.error);