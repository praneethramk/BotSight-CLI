import { crawlPageStatic, crawlPageDynamic, crawlPage } from './crawler';

// Mock the axios module
jest.mock('axios');
const mockedAxios = require('axios');

// Mock the playwright module
jest.mock('playwright');
const mockedPlaywright = require('playwright');

describe('crawler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('crawlPageStatic', () => {
    it('should fetch static HTML content', async () => {
      const mockHtml = '<html><head><title>Test</title></head><body><h1>Hello World</h1></body></html>';
      mockedAxios.get.mockResolvedValue({ data: mockHtml });
      
      const result = await crawlPageStatic('https://example.com');
      expect(result).toBe(mockHtml);
      expect(mockedAxios.get).toHaveBeenCalledWith('https://example.com', {
        headers: {
          'User-Agent': 'BotSight/1.0 (https://botsight.com)'
        }
      });
    });

    it('should throw an error when static fetch fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));
      
      await expect(crawlPageStatic('https://example.com')).rejects.toThrow('Failed to fetch static content');
    });
  });

  // Note: We would add tests for dynamic crawling and intelligent crawling
  // but they require more complex mocking of Playwright
});