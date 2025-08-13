const { tsImport } = require('tsx/esm/api');
tsImport('./esbuild-setup.ts', __filename).then(() => {
  // Get the script to run
  const scriptToRun = process.argv[2];

  // Exit if no script provided
  if (!scriptToRun) {
    process.exit(1);
  }

  // Include env vars from .env.local ?
  const fs = require('node:fs');
  const path = require('node:path');
  const dotenv = require('dotenv');
  const envPath = path.resolve(__dirname, '../../apps/next/.env.local');
  const envPathExists = fs.existsSync(envPath);
  if (envPathExists) {
    dotenv.config({ path: envPath });
  }

  // Run the script
  tsImport(scriptToRun, __filename);
});
