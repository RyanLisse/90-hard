// Minimal version to test what's hanging in the collect-generators script
console.log('Starting minimal generator test...');

// Test basic requires
try {
  console.log('1. Testing node:fs...');
  const fs = require('node:fs');
  console.log('✅ fs loaded');

  console.log('2. Testing glob...');
  const globModule = require('glob');
  const globSync = (globModule).sync;
  console.log('✅ glob loaded');

  console.log('3. Testing basic glob operation...');
  const testGlob = globSync('../../features/**/generators/*.ts', { absolute: true });
  console.log('✅ glob test:', testGlob.length, 'files found');

  console.log('4. Testing file write...');
  const genMsg = '// -i- Auto generated with "npx turbo run @green-stack/core#collect:generators"\n';
  fs.writeFileSync('../../packages/@registries/generators.generated.ts', genMsg);
  console.log('✅ file write test complete');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}

console.log('✅ All tests passed!');