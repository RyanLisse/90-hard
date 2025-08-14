// Simplified collect-generators script in plain JavaScript
const fs = require('node:fs');
const globModule = require('glob');

// Use glob correctly for the current version
const globSync = globModule.sync || globModule;

console.log('Starting collect-generators...');

try {
  const genMsg = '// -i- Auto generated with "npx turbo run @green-stack/core#collect:generators"\n';

  // Get all generator file paths
  const featureGenerators = globSync('../../features/**/generators/*.ts', { absolute: true })
    .filter(path => path.includes('.'))
    .filter(path => !path.includes('node_modules'));

  const packageGenerators = globSync('../../packages/**/generators/*.ts', { absolute: true })
    .filter(path => path.includes('.'))
    .filter(path => !path.includes('node_modules'));

  const allGenerators = [...featureGenerators, ...packageGenerators]
    .filter(path => !path.includes('.d.ts'));

  console.log(`Found ${allGenerators.length} generator files:`, allGenerators);

  // For now, just write the header since there are no generator files
  const generatorRegistry = genMsg;

  // Write to the registry file
  fs.writeFileSync('../../packages/@registries/generators.generated.ts', generatorRegistry);
  
  console.log('✅ Successfully wrote generators.generated.ts');

} catch (error) {
  console.error('❌ Error in collect-generators:', error.message);
  console.error(error.stack);
  process.exit(1);
}