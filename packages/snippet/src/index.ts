// BotSight Snippet IIFE
(function() {
  // Get the script tag
  const script = document.currentScript || document.querySelector('script[data-site-id]');
  const siteId = script && script.getAttribute('data-site-id') ? script.getAttribute('data-site-id') : 'demo-site';
  
  // API endpoint - in production this should be configurable
  const API = 'http://localhost:3000'; // Default to localhost for development

  /**
   * Extract Open Graph meta tags
   * @returns Object containing OG meta tags
   */
  function getOg(): Record<string, string> {
    const metas: Record<string, string> = {};
    document.querySelectorAll('meta[property^="og:"]').forEach(m => {
      const property = m.getAttribute('property');
      const content = m.getAttribute('content');
      if (property && content) {
        metas[property] = content;
      }
    });
    return metas;
  }

  /**
   * Check if page has JSON-LD structured data
   * @returns Boolean indicating presence of JSON-LD
   */
  function hasJsonLd(): boolean {
    return document.querySelectorAll('script[type="application/ld+json"]').length > 0;
  }

  /**
   * Fetch llms.txt file if it exists
   * @returns Promise resolving to llms.txt content or null
   */
  async function fetchLlmsTxt(): Promise<string | null> {
    try {
      const res = await fetch('/.well-known/llms.txt', { 
        method: 'GET', 
        cache: 'no-store' 
      });
      if (res.ok) {
        return await res.text();
      }
    } catch (e) {
      // Silently fail
    }
    return null;
  }

  /**
   * Send telemetry data to the server
   */
  async function ping(): Promise<void> {
    const ua = navigator.userAgent || '';
    
    const payload = {
      siteId,
      url: location.origin + location.pathname, // strip query
      ua,
      extractedSummary: {
        hasJsonLd: hasJsonLd(),
        og: getOg(),
        title: document.title || null,
        h1Count: document.querySelectorAll('h1').length
      },
      ts: new Date().toISOString()
    };

    // Fetch llms.txt
    payload.llmsTxt = await fetchLlmsTxt();

    const body = JSON.stringify(payload);
    
    try {
      // Try sendBeacon first (preferred for telemetry)
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`${API}/v1/telemetry`, body);
      } else {
        // Fallback to fetch
        fetch(`${API}/v1/telemetry`, { 
          method: 'POST', 
          headers: { 'content-type': 'application/json' }, 
          body 
        });
      }
    } catch (e) {
      // Silently fail
      console.error('Failed to send telemetry:', e);
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    ping();
  } else {
    document.addEventListener('DOMContentLoaded', ping);
  }
})();