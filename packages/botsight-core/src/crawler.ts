import axios from 'axios';
import { chromium } from 'playwright';
import FirecrawlApp from '@mendable/firecrawl-js';
import { ScrapeResult } from './types';

/**
 * Crawl a page using FireCrawl for enhanced scraping
 * @param url The URL to crawl
 * @param apiKey The FireCrawl API key
 * @returns Promise resolving to the scraped content with enhanced metadata
 */
export async function crawlPageWithFireCrawl(url: string, apiKey?: string): Promise<any> {
  try {
    // Use FireCrawl's scrape method for comprehensive extraction
    const firecrawl = new FirecrawlApp({ apiKey: apiKey || process.env.FIRECRAWL_API_KEY || '' });
    const response = await firecrawl.scrapeUrl(url, {
      formats: ['markdown', 'html']
    });
    
    return response;
  } catch (error: any) {
    throw new Error(`Failed to fetch content with FireCrawl for ${url}: ${error}`);
  }
}

/**
 * Crawl a page using static HTTP request
 * @param url The URL to crawl
 * @returns Promise resolving to the scraped HTML content
 */
export async function crawlPageStatic(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'BotSight/1.0 (https://botsight.com)'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch static content for ${url}: ${error}`);
  }
}

/**
 * Crawl a page using dynamic rendering with Playwright
 * @param url The URL to crawl
 * @returns Promise resolving to the rendered HTML content
 */
export async function crawlPageDynamic(url: string): Promise<string> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    const html = await page.content();
    return html;
  } catch (error) {
    throw new Error(`Failed to fetch dynamic content for ${url}: ${error}`);
  } finally {
    await browser.close();
  }
}

/**
 * Crawl a page intelligently - first with FireCrawl, then static, then dynamic if needed
 * @param url The URL to crawl
 * @param apiKey The FireCrawl API key
 * @returns Promise resolving to the scrape result
 */
export async function crawlPage(url: string, apiKey?: string): Promise<ScrapeResult> {
  // First, try FireCrawl for enhanced extraction
  let firecrawlData: any = null;
  try {
    firecrawlData = await crawlPageWithFireCrawl(url, apiKey);
  } catch (error: any) {
    console.warn(`FireCrawl failed for ${url}, falling back to traditional methods:`, error.message);
  }
  
  // Then try static scraping
  const staticHtml = await crawlPageStatic(url);
  
  // Check if we need dynamic rendering
  // For now, we'll use a simple heuristic: if HTML is small, use dynamic
  const needsDynamic = staticHtml.length < 50000; // 50KB threshold
  
  let dynamicHtml: string | undefined;
  if (needsDynamic) {
    dynamicHtml = await crawlPageDynamic(url);
  }
  
  return {
    url,
    staticHtml,
    dynamicHtml,
    timestamp: new Date()
  };
}

/**
 * Enhanced crawl with FireCrawl data integration
 * @param url The URL to crawl
 * @param apiKey The FireCrawl API key
 * @returns Promise resolving to enhanced scrape result with FireCrawl data
 */
export async function crawlPageEnhanced(url: string, apiKey?: string): Promise<any> {
  // Get FireCrawl data
  let firecrawlData: any = null;
  try {
    firecrawlData = await crawlPageWithFireCrawl(url, apiKey);
  } catch (error: any) {
    console.warn(`FireCrawl failed for ${url}:`, error.message);
  }
  
  // Get traditional scraping data
  const traditionalResult = await crawlPage(url, apiKey);
  
  // Combine data for maximum extraction
  return {
    ...traditionalResult,
    firecrawlData,
    // Enhanced metadata from FireCrawl
    markdown: firecrawlData?.markdown,
    links: firecrawlData?.links,
    screenshot: firecrawlData?.screenshot,
    extractedSchema: firecrawlData?.extract?.schema,
    extractedData: firecrawlData?.extract
  };
}