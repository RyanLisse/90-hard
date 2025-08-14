// Modern tsx approach - register tsx/esm directly
require('esbuild-register');

// Get the script to run
const scriptToRun = process.argv[2];

// Exit if no script provided
if (!scriptToRun) {
  console.error('No script provided');
  process.exit(1);
}

// Include env vars from .env.local
const fs = require('node:fs');
const path = require('node:path');
const envPath = path.resolve(__dirname, '../../apps/next/.env.local');
const envPathExists = fs.existsSync(envPath);

if (envPathExists) {
  try {
    const dotenv = require('dotenv');
    dotenv.config({ path: envPath });
  } catch (error) {
    console.warn('Could not load dotenv:', error.message);
  }
}

// Setup aliases before running the script
try {
  require('./esbuild-setup.ts');
} catch (error) {
  console.error('Failed to setup esbuild:', error.message);
  process.exit(1);
}

// Run the TypeScript script directly
try {
  require(scriptToRun);
} catch (error) {
  console.error('Script execution failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
