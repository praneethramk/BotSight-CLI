#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import {
  crawlPage,
  crawlPageEnhanced,
  validateScrape,
  extractStructuredData,
  generateSnippet,
  generateEnhancedSnippet
} from 'botsight-core';

const program = new Command();

program
  .name('botsight')
  .description('CLI tool for BotSight - making websites agentic-browser friendly')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize BotSight configuration')
  .action(async () => {
    const config = {
      agentAPI: 'https://your-site.com/api/agents',
      outputDir: './botsight-output'
    };
    
    await fs.writeJSON('./botsight.config.json', config, { spaces: 2 });
    console.log(chalk.green('✓ BotSight configuration created successfully!'));
  });

program
  .command('crawl')
  .description('Crawl a webpage and generate BotSight metadata')
  .argument('<url>', 'URL to crawl')
  .option('-o, --output <dir>', 'Output directory', './botsight-output')
  .option('--simulate', 'Simulate agent visit')
  .option('--enhanced', 'Use enhanced scraping with FireCrawl')
  .action(async (url, options) => {
    const spinner = ora('Crawling page...').start();
    
    try {
      // Crawl the page
      let scrapeResult: any;
      if (options.enhanced) {
        spinner.text = 'Crawling page with enhanced extraction...';
        scrapeResult = await crawlPageEnhanced(url);
      } else {
        scrapeResult = await crawlPage(url);
      }
      
      spinner.text = 'Validating scrape...';
      
      // Validate the scrape
      const validationResult = validateScrape(
        url,
        scrapeResult.staticHtml,
        scrapeResult.dynamicHtml
      );
      
      spinner.text = 'Extracting structured data...';
      
      // Extract structured data
      const htmlToUse = scrapeResult.dynamicHtml || scrapeResult.staticHtml;
      const structuredData = extractStructuredData(htmlToUse, scrapeResult.firecrawlData);
      
      spinner.text = 'Generating snippet...';
      
      // Generate snippet
      const snippet = options.enhanced 
        ? generateEnhancedSnippet(structuredData, scrapeResult.firecrawlData, {
            agentAPI: 'https://your-site.com/api/agents'
          })
        : generateSnippet(structuredData, {
            agentAPI: 'https://your-site.com/api/agents'
          });
      
      spinner.succeed('Analysis complete!');
      
      // Create output directory
      await fs.ensureDir(options.output);
      
      // Save results
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputBase = path.join(options.output, timestamp);
      
      // Save validation report
      await fs.writeJSON(`${outputBase}-validation.json`, validationResult, { spaces: 2 });
      
      // Save structured data
      await fs.writeJSON(`${outputBase}-data.json`, structuredData, { spaces: 2 });
      
      // Save FireCrawl data if available
      if (scrapeResult.firecrawlData) {
        await fs.writeJSON(`${outputBase}-firecrawl.json`, scrapeResult.firecrawlData, { spaces: 2 });
      }
      
      // Save snippet
      await fs.writeFile(`${outputBase}-snippet.html`, snippet.html);
      
      // Save snippet JSON
      await fs.writeJSON(`${outputBase}-snippet.json`, snippet.json, { spaces: 2 });
      
      // Display results
      console.log('\n' + chalk.bold('Validation Report:'));
      console.log(chalk.blue(`Confidence Score: ${validationResult.confidence.toFixed(2)}`));
      
      if (validationResult.missingElements.length > 0) {
        console.log(chalk.yellow('\nMissing Elements:'));
        validationResult.missingElements.forEach(element => {
          console.log(`  - ${element}`);
        });
      }
      
      console.log(chalk.bold('\nGenerated Files:'));
      console.log(`  - ${outputBase}-validation.json`);
      console.log(`  - ${outputBase}-data.json`);
      console.log(`  - ${outputBase}-snippet.html`);
      console.log(`  - ${outputBase}-snippet.json`);
      if (scrapeResult.firecrawlData) {
        console.log(`  - ${outputBase}-firecrawl.json`);
      }
      
      if (options.simulate) {
        console.log(chalk.bold('\n🤖 Agent Simulation Mode:'));
        console.log('An AI agent would see the following structured data:');
        console.log(chalk.gray(snippet.html));
      }
      
      console.log(chalk.green('\n✓ BotSight analysis completed successfully!'));
    } catch (error) {
      spinner.fail('Crawling failed');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate a webpage scrape')
  .argument('<url>', 'URL to validate')
  .action(async (url) => {
    const spinner = ora('Validating page...').start();
    
    try {
      // Crawl the page
      const scrapeResult = await crawlPage(url);
      
      // Validate the scrape
      const validationResult = validateScrape(
        url,
        scrapeResult.staticHtml,
        scrapeResult.dynamicHtml
      );
      
      spinner.succeed('Validation complete!');
      
      // Display results
      console.log('\n' + chalk.bold('Validation Report:'));
      console.log(chalk.blue(`Confidence Score: ${validationResult.confidence.toFixed(2)}`));
      console.log(chalk.blue(`Static Size: ${validationResult.staticSize} bytes`));
      
      if (validationResult.dynamicSize) {
        console.log(chalk.blue(`Dynamic Size: ${validationResult.dynamicSize} bytes`));
      }
      
      if (validationResult.missingElements.length > 0) {
        console.log(chalk.yellow('\nMissing Elements:'));
        validationResult.missingElements.forEach(element => {
          console.log(`  - ${element}`);
        });
      } else {
        console.log(chalk.green('\n✓ All essential elements present!'));
      }
      
      console.log(chalk.green('\n✓ Validation completed successfully!'));
    } catch (error) {
      spinner.fail('Validation failed');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

program
  .command('generate')
  .description('Generate BotSight snippet from JSON data')
  .argument('<dataFile>', 'Path to JSON data file')
  .option('-o, --output <file>', 'Output file for snippet', './botsight-snippet.html')
  .action(async (dataFile, options) => {
    const spinner = ora('Generating snippet...').start();
    
    try {
      // Read the data file
      const data = await fs.readJSON(dataFile);
      
      // Generate snippet
      const snippet = generateSnippet(data, {
        agentAPI: 'https://your-site.com/api/agents'
      });
      
      // Save snippet
      await fs.writeFile(options.output, snippet.html);
      
      spinner.succeed('Snippet generated successfully!');
      
      console.log(chalk.bold('\nGenerated Snippet:'));
      console.log(chalk.gray(snippet.html));
      console.log(chalk.green(`\n✓ Saved to ${options.output}`));
    } catch (error) {
      spinner.fail('Snippet generation failed');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

program.parse();