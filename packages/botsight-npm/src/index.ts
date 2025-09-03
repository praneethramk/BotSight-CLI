/**
 * BotSight Snippet - Inject structured data for AI agents
 * Zero-dependency, browser-compatible JavaScript module
 */

interface BotSightConfig {
  name?: string;
  url?: string;
  description?: string;
  offers?: any[];
  faqs?: any[];
  agentAPI?: string;
  [key: string]: any;
}

/**
 * Inject BotSight structured data into the document head
 * @param config Configuration object with site metadata
 */
export function injectBotSight(config: BotSightConfig): void {
  // Create the JSON-LD schema
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    ...config
  };

  // Create script element
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'botsight-schema';
  script.textContent = JSON.stringify(schema, null, 2);

  // Inject into document head
  document.head.appendChild(script);
}

/**
 * Check if BotSight schema is already present
 * @returns boolean indicating if BotSight schema exists
 */
export function hasBotSight(): boolean {
  return !!document.getElementById('botsight-schema');
}

// For CommonJS compatibility
export default {
  injectBotSight,
  hasBotSight
};