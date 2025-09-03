export interface ScrapeResult {
  url: string;
  staticHtml: string;
  dynamicHtml?: string;
  timestamp: Date;
}

export interface ValidationResult {
  confidence: number;
  missingElements: string[];
  staticSize: number;
  dynamicSize?: number;
  domNodeCount?: number;
  keywordCoverage?: number;
  schemaPresence?: boolean;
  metaTagsCompleteness?: number;
}

export interface StructuredData {
  title?: string;
  description?: string;
  canonical?: string;
  opengraph?: Record<string, string>;
  twitter?: Record<string, string>;
  schemaLd?: Record<string, any>;
  offers?: any[];
  faqs?: any[];
  headings?: {
    h1?: string[];
    h2?: string[];
  };
  ctas?: {
    text: string;
    url: string;
  }[];
  [key: string]: any;
}

export interface Snippet {
  html: string;
  json: Record<string, any>;
}