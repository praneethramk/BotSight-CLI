// Test the botsight-npm package
import { injectBotSight } from './packages/botsight-npm/dist/index.mjs';

// Test data
const testData = {
  name: "Test Site",
  url: "https://test.com",
  description: "This is a test site",
  offers: [
    {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free premium access"
    }
  ]
};

// Inject the BotSight schema
injectBotSight(testData);

// Check if it was injected
console.log('BotSight injected:', document.getElementById('botsight-schema') ? 'Yes' : 'No');