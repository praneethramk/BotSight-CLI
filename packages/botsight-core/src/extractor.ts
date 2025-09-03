import * as cheerio from 'cheerio';
import { StructuredData } from './types';

/**
 * Extract structured data from HTML content with enhanced FireCrawl data
 * @param html The HTML content to extract from
 * @param firecrawlData Optional FireCrawl extracted data
 * @returns StructuredData object with parsed information
 */
export function extractStructuredData(html: string, firecrawlData?: any): StructuredData {
  const $ = cheerio.load(html);
  const data: StructuredData = {};
  
  // Extract from FireCrawl data if available
  if (firecrawlData?.extract) {
    // Use FireCrawl's extracted data as primary source
    Object.assign(data, extractFromFireCrawl(firecrawlData.extract));
  }
  
  // Extract title
  data.title = $('title').text().trim() || undefined;
  
  // Extract meta description
  data.description = $('meta[name="description"]').attr('content') || undefined;
  
  // Extract canonical URL
  data.canonical = $('link[rel="canonical"]').attr('href') || undefined;
  
  // Extract OpenGraph data
  data.opengraph = extractOpenGraph($);
  
  // Extract Twitter Card data
  data.twitter = extractTwitterCards($);
  
  // Extract JSON-LD schema
  data.schemaLd = extractJsonLd($);
  
  // Extract headings
  data.headings = {
    h1: $('h1').map((_, el) => $(el).text().trim()).get(),
    h2: $('h2').map((_, el) => $(el).text().trim()).get()
  };
  
  // Extract primary CTAs (buttons/links)
  data.ctas = extractCTAs($);
  
  // Extract offers and FAQs from schema if available
  if (data.schemaLd) {
    data.offers = extractOffersFromSchema(data.schemaLd);
    data.faqs = extractFaqsFromSchema(data.schemaLd);
  }
  
  return data;
}

/**
 * Extract structured data from FireCrawl extracted data
 * @param firecrawlExtract FireCrawl extracted data
 * @returns Partial StructuredData object
 */
function extractFromFireCrawl(firecrawlExtract: any): Partial<StructuredData> {
  const data: Partial<StructuredData> = {};
  
  // Extract metadata from FireCrawl
  if (firecrawlExtract.metadata) {
    data.title = firecrawlExtract.metadata.title || data.title;
    data.description = firecrawlExtract.metadata.description || data.description;
  }
  
  // Extract schema data
  if (firecrawlExtract.schema) {
    data.schemaLd = firecrawlExtract.schema;
  }
  
  // Extract offers
  if (firecrawlExtract.offers) {
    data.offers = firecrawlExtract.offers;
  }
  
  // Extract FAQs
  if (firecrawlExtract.faqs) {
    data.faqs = firecrawlExtract.faqs;
  }
  
  return data;
}

/**
 * Extract OpenGraph metadata
 * @param $ Cheerio instance
 * @returns Object with OpenGraph properties
 */
function extractOpenGraph($: cheerio.CheerioAPI): Record<string, string> | undefined {
  const ogData: Record<string, string> = {};
  $('meta[property^="og:"]').each((_, el) => {
    const property = $(el).attr('property');
    const content = $(el).attr('content');
    if (property && content) {
      // Remove the "og:" prefix
      const key = property.replace('og:', '');
      ogData[key] = content;
    }
  });
  
  return Object.keys(ogData).length > 0 ? ogData : undefined;
}

/**
 * Extract Twitter Card metadata
 * @param $ Cheerio instance
 * @returns Object with Twitter Card properties
 */
function extractTwitterCards($: cheerio.CheerioAPI): Record<string, string> | undefined {
  const twitterData: Record<string, string> = {};
  $('meta[name^="twitter:"]').each((_, el) => {
    const name = $(el).attr('name');
    const content = $(el).attr('content');
    if (name && content) {
      // Remove the "twitter:" prefix
      const key = name.replace('twitter:', '');
      twitterData[key] = content;
    }
  });
  
  return Object.keys(twitterData).length > 0 ? twitterData : undefined;
}

/**
 * Extract JSON-LD structured data
 * @param $ Cheerio instance
 * @returns Parsed JSON-LD object or undefined
 */
function extractJsonLd($: cheerio.CheerioAPI): Record<string, any> | undefined {
  const scriptTags = $('script[type="application/ld+json"]');
  if (scriptTags.length === 0) return undefined;
  
  try {
    // For simplicity, we'll take the first JSON-LD script
    const jsonLdContent = scriptTags.first().html();
    if (jsonLdContent) {
      return JSON.parse(jsonLdContent);
    }
  } catch (error) {
    console.warn('Failed to parse JSON-LD:', error);
  }
  
  return undefined;
}

/**
 * Extract primary CTAs (Call To Actions)
 * @param $ Cheerio instance
 * @returns Array of CTA objects
 */
function extractCTAs($: cheerio.CheerioAPI): { text: string; url: string }[] {
  const ctas: { text: string; url: string }[] = [];
  
  // Look for common CTA elements
  const ctaSelectors = [
    'a[href*="signup"]',
    'a[href*="register"]',
    'a[href*="start"]',
    'a[href*="get"]',
    'a[href*="try"]',
    'a.btn',
    'button[type="submit"]',
    '.cta-button',
    '.btn-primary'
  ];
  
  ctaSelectors.forEach(selector => {
    $(selector).each((_, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      const url = $el.attr('href') || '';
      
      // Skip if already added
      if (text && !ctas.some(cta => cta.text === text)) {
        ctas.push({ text, url });
      }
    });
  });
  
  // Limit to top 5 CTAs to avoid noise
  return ctas.slice(0, 5);
}

/**
 * Extract offers from schema data
 * @param schema Schema data
 * @returns Array of offers or undefined
 */
function extractOffersFromSchema(schema: Record<string, any>): any[] | undefined {
  if (schema.offers) {
    return Array.isArray(schema.offers) ? schema.offers : [schema.offers];
  }
  
  // Check if this is an Offer type schema
  if (schema['@type'] === 'Offer' || 
      (Array.isArray(schema['@type']) && schema['@type'].includes('Offer'))) {
    return [schema];
  }
  
  return undefined;
}

/**
 * Extract FAQs from schema data
 * @param schema Schema data
 * @returns Array of FAQs or undefined
 */
function extractFaqsFromSchema(schema: Record<string, any>): any[] | undefined {
  if (schema.faq || schema.faqs) {
    const faqData = schema.faq || schema.faqs;
    return Array.isArray(faqData) ? faqData : [faqData];
  }
  
  // Check for FAQPage type
  if (schema['@type'] === 'FAQPage') {
    return schema.mainEntity || [];
  }
  
  return undefined;
}