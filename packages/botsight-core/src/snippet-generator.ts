import { StructuredData, Snippet } from './types';

/**
 * Generate a JavaScript snippet that injects structured data into the DOM
 * @param data The structured data to inject
 * @param options Optional configuration
 * @returns Snippet object with HTML and JSON representations
 */
export function generateSnippet(
  data: StructuredData,
  options?: { agentAPI?: string }
): Snippet {
  // Create the JSON-LD object
  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    ...(data.schemaLd || {})
  };
  
  // Add/override with extracted data
  if (data.title && !jsonLd.name) {
    jsonLd.name = data.title;
  }
  
  if (data.description && !jsonLd.description) {
    jsonLd.description = data.description;
  }
  
  if (data.canonical && !jsonLd.url) {
    jsonLd.url = data.canonical;
  }
  
  // Add offers if available
  if (data.offers && !jsonLd.offers) {
    jsonLd.offers = data.offers;
  }
  
  // Add FAQs if available
  if (data.faqs && !jsonLd.faqs) {
    jsonLd.faqs = data.faqs;
  }
  
  // Add agent API endpoint if provided
  if (options?.agentAPI) {
    jsonLd.agentAPI = options.agentAPI;
  }
  
  // Generate the HTML snippet
  const html = `
<script type="application/ld+json" id="botsight-schema">
${JSON.stringify(jsonLd, null, 2)}
</script>`;
  
  return {
    html: html.trim(),
    json: jsonLd
  };
}

/**
 * Generate an enhanced snippet with additional metadata for better agent detection
 * @param data The structured data to inject
 * @param firecrawlData Optional FireCrawl data
 * @param options Optional configuration
 * @returns Enhanced snippet object with HTML and JSON representations
 */
export function generateEnhancedSnippet(
  data: StructuredData,
  firecrawlData?: any,
  options?: { agentAPI?: string, siteName?: string }
): Snippet {
  // Create the enhanced JSON-LD object
  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    ...(data.schemaLd || {})
  };
  
  // Add/override with extracted data
  if (data.title && !jsonLd.name) {
    jsonLd.name = data.title;
  }
  
  if (data.description && !jsonLd.description) {
    jsonLd.description = data.description;
  }
  
  if (data.canonical && !jsonLd.url) {
    jsonLd.url = data.canonical;
  }
  
  // Add offers if available
  if (data.offers && !jsonLd.offers) {
    jsonLd.offers = data.offers;
  }
  
  // Add FAQs if available
  if (data.faqs && !jsonLd.faqs) {
    jsonLd.faqs = data.faqs;
  }
  
  // Add headings for content structure
  if (data.headings) {
    jsonLd.headings = data.headings;
  }
  
  // Add CTAs for agent interaction guidance
  if (data.ctas) {
    jsonLd.ctas = data.ctas;
  }
  
  // Add FireCrawl extracted data if available
  if (firecrawlData?.extract?.metadata) {
    jsonLd.datePublished = firecrawlData.extract.metadata.publishedAt || jsonLd.datePublished;
    jsonLd.author = firecrawlData.extract.metadata.author || jsonLd.author;
    jsonLd.publisher = firecrawlData.extract.metadata.publisher || jsonLd.publisher;
  }
  
  // Add site name if provided
  if (options?.siteName) {
    jsonLd.siteName = options.siteName;
  }
  
  // Add agent API endpoint if provided
  if (options?.agentAPI) {
    jsonLd.agentAPI = options.agentAPI;
  }
  
  // Add BotSight specific metadata
  jsonLd.botsight = {
    version: '1.0.0',
    extractedAt: new Date().toISOString(),
    confidenceIndicators: {
      hasTitle: !!data.title,
      hasDescription: !!data.description,
      hasSchema: !!data.schemaLd,
      hasHeadings: !!(data.headings?.h1?.length || data.headings?.h2?.length),
      hasCTAs: !!data.ctas?.length
    }
  };
  
  // Generate the HTML snippet
  const html = `
<script type="application/ld+json" id="botsight-schema">
${JSON.stringify(jsonLd, null, 2)}
</script>`;
  
  return {
    html: html.trim(),
    json: jsonLd
  };
}