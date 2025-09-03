// Test all CLI commands
import { spawn } from 'child_process';
import fs from 'fs';

// Test CLI help command
console.log('Testing CLI help command...');
const help = spawn('node', ['packages/botsight-cli/dist/cli.js', '--help']);

help.stdout.on('data', (data) => {
  console.log(`Help output: ${data}`);
});

help.on('close', (code) => {
  console.log(`Help command exited with code ${code}`);
  
  // Test CLI version command
  console.log('\nTesting CLI version command...');
  const version = spawn('node', ['packages/botsight-cli/dist/cli.js', '--version']);
  
  version.stdout.on('data', (data) => {
    console.log(`Version output: ${data}`);
  });
  
  version.on('close', (code) => {
    console.log(`Version command exited with code ${code}`);
    
    // Test CLI init command
    console.log('\nTesting CLI init command...');
    const init = spawn('node', ['packages/botsight-cli/dist/cli.js', 'init']);
    
    init.stdout.on('data', (data) => {
      console.log(`Init output: ${data}`);
    });
    
    init.on('close', (code) => {
      console.log(`Init command exited with code ${code}`);
      
      // Check if config file was created
      if (fs.existsSync('botsight.config.json')) {
        console.log('Configuration file created successfully');
        const config = fs.readFileSync('botsight.config.json', 'utf8');
        console.log('Config content:', config);
      } else {
        console.log('Configuration file was not created');
      }
    });
  });
});