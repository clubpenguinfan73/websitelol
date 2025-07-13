#!/usr/bin/env node

// Simple startup script that works with the current environment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting development server...');

// Check for TypeScript server
const tsServerPath = path.join(__dirname, 'server', 'index.ts');
const simpleServerPath = path.join(__dirname, 'simple-server.js');

if (fs.existsSync(tsServerPath)) {
  console.log('TypeScript server found, attempting to start...');
  
  try {
    // Try to run with tsx if available
    const { spawn } = require('child_process');
    const tsxPath = path.join(__dirname, 'node_modules', '.bin', 'tsx');
    
    if (fs.existsSync(tsxPath)) {
      console.log('Using tsx to run TypeScript server...');
      const server = spawn(tsxPath, [tsServerPath], {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'development' }
      });
      
      server.on('error', (error) => {
        console.error('TypeScript server failed:', error.message);
        console.log('Falling back to simple server...');
        fallbackToSimpleServer();
      });
      
      server.on('exit', (code) => {
        if (code !== 0) {
          console.log(`TypeScript server exited with code ${code}, falling back...`);
          fallbackToSimpleServer();
        }
      });
    } else {
      console.log('tsx not found, falling back to simple server...');
      fallbackToSimpleServer();
    }
    
  } catch (error) {
    console.error('Error starting TypeScript server:', error.message);
    console.log('Falling back to simple server...');
    fallbackToSimpleServer();
  }
} else {
  console.log('TypeScript server not found, using simple server...');
  fallbackToSimpleServer();
}

function fallbackToSimpleServer() {
  console.log('Starting simple server...');
  
  if (fs.existsSync(simpleServerPath)) {
    const { spawn } = require('child_process');
    const server = spawn('node', [simpleServerPath], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });
    
    server.on('error', (error) => {
      console.error('Simple server failed:', error.message);
      process.exit(1);
    });
    
    server.on('exit', (code) => {
      console.log(`Simple server exited with code ${code}`);
      process.exit(code);
    });
  } else {
    console.error('No server files found!');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});