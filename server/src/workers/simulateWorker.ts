import { chromium, Browser, Page } from 'playwright';
import { query } from '../db';
import * as fs from 'fs';
import * as path from 'path';

export interface SimulationJob {
  jobId: number;
}

export async function runSimulation({ jobId }: SimulationJob): Promise<void> {
  let browser: Browser | null = null;
  
  try {
    // Read job row
    const jobRes = await query('SELECT * FROM simulations WHERE id=$1', [jobId]);
    
    if (jobRes.rowCount === 0) {
      throw new Error(`Simulation job with ID ${jobId} not found`);
    }
    
    const job = jobRes.rows[0];
    
    // Update job status to running
    await query(
      'UPDATE simulations SET status=$1, started_at=now() WHERE id=$2', 
      ['running', jobId]
    );

    // Lookup agent UA by agent name
    const agentRes = await query(
      'SELECT pattern, example_ua FROM agents WHERE name=$1 LIMIT 1', 
      [job.agent_name]
    );
    
    const agentRow = agentRes.rows[0];
    const ua = agentRow?.example_ua || 'Mozilla/5.0 (compatible; BotSightSim/1.0; +https://botsight.ai)';

    // Launch browser with specific user agent
    browser = await chromium.launch({ 
      headless: process.env.PLAYWRIGHT_HEADLESS !== 'false' 
    });
    
    const context = await browser.newContext({ userAgent: ua });
    const page: Page = await context.newPage();

    // Navigate to URL
    await page.goto(job.url, { 
      waitUntil: 'networkidle', 
      timeout: 60000 
    });

    // Extract JSON-LD
    const jslds = await page.$$eval(
      'script[type="application/ld+json"]', 
      els => els.map(e => e.textContent)
    );

    // Extract meta tags
    const metas = await page.$$eval(
      'meta', 
      nodes => nodes.map(n => ({
        name: n.getAttribute('name'),
        property: n.getAttribute('property'),
        content: n.getAttribute('content')
      }))
    );

    // Get title and h1
    const title = await page.title();
    const h1 = await page.$eval('h1', el => el?.textContent?.trim()).catch(() => null);

    // Take screenshot
    const screenshotDir = path.join(__dirname, '../../../screenshots');
    
    // Ensure screenshots directory exists
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    const screenshotPath = path.join(screenshotDir, `sim-${jobId}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Build result object
    const result = { 
      visible_jsonld: jslds, 
      meta: metas, 
      title, 
      h1 
    };

    // Determine screenshot URL (local path for now, could be S3 URL)
    const screenshotUrl = `file://${screenshotPath}`;

    // Update job with results
    await query(
      'UPDATE simulations SET status=$1, result=$2, screenshot_url=$3, finished_at=now() WHERE id=$4',
      ['done', JSON.stringify(result), screenshotUrl, jobId]
    );
  } catch (err) {
    console.error('Simulation error:', err);
    
    // Update job with error
    await query(
      'UPDATE simulations SET status=$1, result=$2, finished_at=now() WHERE id=$3',
      ['failed', JSON.stringify({ error: err.message }), jobId]
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}