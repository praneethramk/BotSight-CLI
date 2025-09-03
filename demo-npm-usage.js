// Demonstration of how to use the botsight-npm package
import fs from 'fs';

// In a real scenario, this would be:
// import { injectBotSight } from "botsight-snippet";

// For this demo, we'll use the built version
import { injectBotSight } from './packages/botsight-npm/dist/index.mjs';

// Read the structured data that was extracted by BotSight
const extractedData = JSON.parse(fs.readFileSync('botsight-output/2025-09-03T22-22-33-698Z-data.json', 'utf8'));

// Prepare data for the npm package
const botSightData = {
  name: extractedData.title,
  description: extractedData.description,
  url: "https://staging.fundvault.in",
  // Add any additional data that was extracted
  offers: extractedData.offers || [],
  faqs: extractedData.faqs || []
};

console.log('Injecting BotSight structured data...');
console.log('Data to inject:', JSON.stringify(botSightData, null, 2));

// In a browser environment, this would inject the script into the page
// For this demo, we'll just show what would happen
console.log('\n✅ In a browser environment, this would inject the following script into the <head>:');

const mockDocument = {
  head: {
    appendChild: (script) => {
      console.log('<head>');
      console.log(script.outerHTML);
      console.log('</head>');
    }
  },
  getElementById: () => null
};

// Mock the document object for demonstration
global.document = mockDocument;

// Mock the script element creation
const originalCreateElement = global.document.createElement;
global.document.createElement = function(tag) {
  if (tag === 'script') {
    return {
      type: '',
      id: '',
      textContent: '',
      outerHTML: '<script type="application/ld+json" id="botsight-schema">\n{\n  "@context": "https://schema.org",\n  "@type": "WebSite"\n}</script>',
      set type(value) { this._type = value; },
      get type() { return this._type; },
      set id(value) { this._id = value; },
      get id() { return this._id; },
      set textContent(value) { this._textContent = value; },
      get textContent() { return this._textContent; }
    };
  }
  return originalCreateElement ? originalCreateElement.call(this, tag) : {};
};

// Inject the BotSight structured data
injectBotSight(botSightData);

console.log('\n🎉 The website is now AI-agent friendly!');
console.log('AI agents can immediately parse the structured data injected by BotSight.');