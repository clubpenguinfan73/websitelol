import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// First, let's check if we can restore the working vite.config.ts
function restoreViteConfig() {
    const backupPath = path.join(__dirname, 'vite.config.ts.backup');
    const configPath = path.join(__dirname, 'vite.config.ts');
    
    if (fs.existsSync(backupPath)) {
        console.log('Restoring vite.config.ts from backup...');
        fs.copyFileSync(backupPath, configPath);
        return true;
    }
    return false;
}

// If TypeScript server fails, fall back to simple server
function fallbackToSimpleServer() {
    console.log('Falling back to simple server...');
    
    const simpleServer = spawn('node', ['simple-server.js'], {
        stdio: 'inherit',
        env: {
            ...process.env,
            NODE_ENV: 'development',
            PORT: process.env.PORT || '5000'
        }
    });
    
    simpleServer.on('error', (error) => {
        console.error('Simple server failed:', error);
        process.exit(1);
    });
    
    simpleServer.on('exit', (code) => {
        console.log(`Simple server exited with code ${code}`);
        process.exit(code);
    });
}

// Try to start the main server
function startMainServer() {
    console.log('Starting main server...');
    
    const mainServer = spawn('node', ['server-runner.mjs'], {
        stdio: 'inherit',
        env: {
            ...process.env,
            NODE_ENV: 'development',
            PORT: process.env.PORT || '5000'
        }
    });
    
    let serverFailed = false;
    
    mainServer.on('error', (error) => {
        console.error('Main server failed to start:', error);
        serverFailed = true;
        fallbackToSimpleServer();
    });
    
    mainServer.on('exit', (code) => {
        console.log(`Main server exited with code ${code}`);
        if (code !== 0 && !serverFailed) {
            console.log('Main server failed, trying fallback...');
            fallbackToSimpleServer();
        } else {
            process.exit(code);
        }
    });
    
    // If server doesn't start within 10 seconds, consider it failed
    setTimeout(() => {
        if (!serverFailed) {
            console.log('Main server seems to be running properly');
        }
    }, 10000);
}

// Main execution
console.log('Starting development server...');

// Try to restore vite config if available
restoreViteConfig();

// Start the main server
startMainServer();