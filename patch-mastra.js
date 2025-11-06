// This patch makes function names configurable before loading Mastra
// Run this with: node patch-mastra.js

import fs from 'fs';
import path from 'path';

const mastraPath = path.join(process.cwd(), '.mastra', 'output', 'mastra.mjs');

try {
  // Read the Mastra compiled file
  const content = fs.readFileSync(mastraPath, 'utf8');
  
  // Replace the problematic line
  const patchedContent = content.replace(
    /SequenceMatcher\.name\s*=\s*['"]SequenceMatcher['"]/g,
    '// Patched: SequenceMatcher.name assignment removed'
  );
  
  // Write the patched file back
  fs.writeFileSync(mastraPath, patchedContent);
  
  console.log('✅ Mastra has been successfully patched!');
  console.log('You can now run your Mastra application normally.');
} catch (error) {
  console.error('❌ Failed to patch Mastra:', error.message);
  process.exit(1);
}
