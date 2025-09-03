import { test, expect, jest } from '@jest/globals';
import { runSimulation } from '../src/workers/simulateWorker';

// Mock Playwright
jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn().mockResolvedValue({
      newContext: jest.fn().mockResolvedValue({
        newPage: jest.fn().mockResolvedValue({
          goto: jest.fn(),
          $$eval: jest.fn().mockResolvedValue([]),
          title: jest.fn().mockResolvedValue('Test Page'),
          $eval: jest.fn().mockResolvedValue('Test Heading'),
          screenshot: jest.fn(),
        }),
      }),
      close: jest.fn(),
    }),
  },
}));

// Mock database
jest.mock('../src/db', () => ({
  query: jest.fn(),
}));

describe('Simulation Worker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should process simulation job successfully', async () => {
    // Mock database responses
    const mockQuery = require('../src/db').query;
    mockQuery
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, url: 'http://example.com', agent_name: 'GPTBot' }] }) // Job lookup
      .mockResolvedValueOnce({}) // Update job status
      .mockResolvedValueOnce({ rows: [{ example_ua: 'GPTBot/1.0' }] }) // Agent lookup
      .mockResolvedValueOnce({}); // Update job result

    await runSimulation({ jobId: 1 });

    expect(mockQuery).toHaveBeenCalledTimes(4);
  });

  test('should handle missing job gracefully', async () => {
    // Mock database responses
    const mockQuery = require('../src/db').query;
    mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] }); // Job not found

    await expect(runSimulation({ jobId: 999 })).rejects.toThrow('Simulation job with ID 999 not found');
  });
});