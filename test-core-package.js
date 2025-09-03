// Test the botsight-core package
import { extractStructuredData, generateSnippet } from './packages/botsight-core/dist/index.js';

// Sample HTML content
const sampleHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Page</title>
    <meta name="description" content="This is a test page">
    <link rel="canonical" href="https://test.com/">
    <meta property="og:title" content="Test Page">
    <meta property="og:description" content="This is a test page">
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Test Site",
      "url": "https://test.com/"
    }
    </script>
</head>
<body>
    <h1>Welcome to Test Page</h1>
    <h2>Subheading</h2>
    <p>This is a test page.</p>
    <a href="/signup" class="btn">Sign Up</a>
</body>
</html>
`;

// Extract structured data
const structuredData = extractStructuredData(sampleHtml);
console.log('Extracted structured data:', structuredData);

// Generate snippet
const snippet = generateSnippet(structuredData, { agentAPI: 'https://test.com/api/agents' });
console.log('Generated snippet:', snippet.html);