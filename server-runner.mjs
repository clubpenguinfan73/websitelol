#!/usr/bin/env node

// ES Module server runner with proper import.meta.dirname support
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting server with ES module support...');

// Set up proper environment variables for ES modules
const env = {
  ...process.env,
  NODE_ENV: 'development',
  FORCE_COLOR: '1',
  NODE_OPTIONS: '--import tsx/esm'
};

const tsxPath = join(__dirname, 'node_modules', '.bin', 'tsx');
const serverPath = join(__dirname, 'server', 'index.ts');

if (existsSync(tsxPath) && existsSync(serverPath)) {
  console.log('Launching TypeScript server with tsx...');
  
  const server = spawn(tsxPath, [serverPath], {
    stdio: 'inherit',
    env,
    cwd: __dirname
  });
  
  server.on('error', (error) => {
    console.error('Server failed to start:', error.message);
    process.exit(1);
  });
  
  server.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
    process.exit(code);
  });
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    server.kill('SIGTERM');
  });
  
  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    server.kill('SIGINT');
  });
} else {
  console.error('Required files not found');
  process.exit(1);
}