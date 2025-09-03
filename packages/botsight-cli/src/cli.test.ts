import { spawn } from 'child_process';
import path from 'path';

describe('CLI', () => {
  it('should display help when run without arguments', (done) => {
    const cliPath = path.join(__dirname, 'cli.js');
    const child = spawn('node', [cliPath], {
      cwd: path.resolve(__dirname, '..')
    });

    let stdout = '';
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.on('close', (code) => {
      expect(code).toBe(0);
      expect(stdout).toContain('Usage: botsight');
      done();
    });
  });

  it('should display version when --version flag is used', (done) => {
    const cliPath = path.join(__dirname, 'cli.js');
    const child = spawn('node', [cliPath, '--version'], {
      cwd: path.resolve(__dirname, '..')
    });

    let stdout = '';
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.on('close', (code) => {
      expect(code).toBe(0);
      expect(stdout).toMatch(/\d+\.\d+\.\d+/);
      done();
    });
  });
});