// Simple test to debug the generator script
const fs = require('node:fs');

console.log('Starting collect-generators test...');

try {
  // Test if we can create the generator registry file
  const genMsg = '// -i- Auto generated with "npx turbo run @green-stack/core#collect:generators"\n';
  
  console.log('Writing test file...');
  fs.writeFileSync('./packages/@registries/generators.generated.ts', genMsg);
  console.log('✅ File write test successful');
  
  // Read the file back
  const content = fs.readFileSync('./packages/@registries/generators.generated.ts', 'utf8');
  console.log('✅ File read test successful');
  console.log('Content:', content);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}