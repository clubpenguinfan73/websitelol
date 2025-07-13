#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting development server with Vite...');

// Use the fallback vite config
const viteConfigPath = path.join(__dirname, 'vite.config.fallback.js');
const viteBinPath = path.join(__dirname, 'node_modules', '.bin', 'vite');

if (fs.existsSync(viteBinPath) && fs.existsSync(viteConfigPath)) {
  console.log('Using Vite with fallback configuration...');
  
  const viteProcess = spawn(viteBinPath, ['--config', viteConfigPath], {
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_ENV: 'development',
      VITE_API_URL: 'http://localhost:5000'
    }
  });
  
  viteProcess.on('error', (error) => {
    console.error('Vite failed to start:', error.message);
    console.log('Falling back to simple server...');
    startSimpleServer();
  });
  
  viteProcess.on('exit', (code) => {
    if (code !== 0) {
      console.log(`Vite exited with code ${code}, falling back to simple server...`);
      startSimpleServer();
    }
  });
} else {
  console.log('Vite not found, starting simple server...');
  startSimpleServer();
}

function startSimpleServer() {
  const serverPath = path.join(__dirname, 'simple-server.js');
  
  if (fs.existsSync(serverPath)) {
    console.log('Starting simple server...');
    const server = spawn('node', [serverPath], {
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