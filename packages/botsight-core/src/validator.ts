import * as cheerio from 'cheerio';
import { ValidationResult } from './types';

/**
 * Validate a scrape result and return confidence metrics
 * @param url The URL that was scraped
 * @param staticHtml The static HTML content
 * @param dynamicHtml The dynamic HTML content (optional)
 * @returns ValidationResult with confidence score and details
 */
export function validateScrape(
  url: string,
  staticHtml: string,
  dynamicHtml?: string
): ValidationResult {
  const $static = cheerio.load(staticHtml);
  const $dynamic = dynamicHtml ? cheerio.load(dynamicHtml) : null;
  
  // Calculate sizes
  const staticSize = staticHtml.length;
  const dynamicSize = dynamicHtml ? dynamicHtml.length : undefined;
  
  // Calculate DOM node counts
  const staticNodeCount = countNodes($static);
  const dynamicNodeCount = $dynamic ? countNodes($dynamic) : undefined;
  
  // Check for essential elements
  const missingElements: string[] = [];
  
  // Check for title
  if (!$static('title').text().trim()) {
    missingElements.push('title');
  }
  
  // Check for H1
  if (!$static('h1').length) {
    missingElements.push('h1');
  }
  
  // Check for schema (JSON-LD)
  const hasSchema = $static('script[type="application/ld+json"]').length > 0;
  if (!hasSchema) {
    missingElements.push('schema');
  }
  
  // Check for meta description
  if (!$static('meta[name="description"]').attr('content')) {
    missingElements.push('meta:description');
  }
  
  // Check for OpenGraph image
  if (!$static('meta[property="og:image"]').attr('content')) {
    missingElements.push('openGraph:image');
  }
  
  // Calculate confidence score
  // Start with 1.0 and subtract based on missing elements
  let confidence = 1.0;
  
  // Major penalties for critical missing elements
  if (missingElements.includes('title')) confidence -= 0.3;
  if (missingElements.includes('h1')) confidence -= 0.2;
  if (missingElements.includes('schema')) confidence -= 0.2;
  
  // Minor penalties for other missing elements
  const minorMissing = missingElements.filter(e => 
    !['title', 'h1', 'schema'].includes(e)
  ).length;
  confidence -= minorMissing * 0.05;
  
  // Ensure confidence doesn't go below 0
  confidence = Math.max(0, confidence);
  
  // Calculate keyword coverage (simplified)
  const keywordCoverage = calculateKeywordCoverage($static);
  
  // Calculate meta tags completeness
  const metaTagsCompleteness = calculateMetaCompleteness($static);
  
  return {
    confidence,
    missingElements,
    staticSize,
    dynamicSize,
    domNodeCount: dynamicNodeCount || staticNodeCount,
    keywordCoverage,
    schemaPresence: hasSchema,
    metaTagsCompleteness
  };
}

/**
 * Count DOM nodes in a Cheerio instance
 * @param $ Cheerio instance
 * @returns Number of nodes
 */
function countNodes($: cheerio.CheerioAPI): number {
  let count = 0;
  $('*').each(() => { count++; });
  return count;
}

/**
 * Calculate keyword coverage (simplified implementation)
 * @param $ Cheerio instance
 * @returns Coverage score between 0 and 1
 */
function calculateKeywordCoverage($: cheerio.CheerioAPI): number {
  const title = $('title').text().trim();
  const h1 = $('h1').first().text().trim();
  const description = $('meta[name="description"]').attr('content') || '';
  
  // Simple heuristic: check if we have meaningful content
  const hasTitle = title.length > 5;
  const hasH1 = h1.length > 5;
  const hasDescription = description.length > 10;
  
  let score = 0;
  if (hasTitle) score += 0.3;
  if (hasH1) score += 0.3;
  if (hasDescription) score += 0.4;
  
  return score;
}

/**
 * Calculate meta tags completeness
 * @param $ Cheerio instance
 * @returns Completeness score between 0 and 1
 */
function calculateMetaCompleteness($: cheerio.CheerioAPI): number {
  const requiredMetaTags = [
    'description',
    'viewport',
    'charset'
  ];
  
  const optionalMetaTags = [
    'keywords',
    'author',
    'robots'
  ];
  
  let requiredCount = 0;
  let optionalCount = 0;
  
  requiredMetaTags.forEach(tag => {
    if ($(`meta[name="${tag}"]`).length > 0 || 
        (tag === 'charset' && $('meta[charset]').length > 0)) {
      requiredCount++;
    }
  });
  
  optionalMetaTags.forEach(tag => {
    if ($(`meta[name="${tag}"]`).length > 0) {
      optionalCount++;
    }
  });
  
  // Charset can also be in the content-type meta tag
  if ($('meta[http-equiv="content-type"]').length > 0) {
    requiredCount = Math.min(requiredCount + 1, requiredMetaTags.length);
  }
  
  const requiredScore = requiredCount / requiredMetaTags.length;
  const optionalScore = optionalCount / optionalMetaTags.length;
  
  // Weight required tags more heavily
  return (requiredScore * 0.8) + (optionalScore * 0.2);
}