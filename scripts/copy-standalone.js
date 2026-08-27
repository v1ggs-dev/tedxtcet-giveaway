const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const standaloneDir = path.join(rootDir, '.next', 'standalone');
const staticSrc = path.join(rootDir, '.next', 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');
const publicSrc = path.join(rootDir, 'public');
const publicDest = path.join(standaloneDir, 'public');

if (fs.existsSync(standaloneDir)) {
  console.log('📦 Preparing standalone production bundle...');

  // Copy .next/static
  if (fs.existsSync(staticSrc)) {
    fs.cpSync(staticSrc, staticDest, { recursive: true });
    console.log('✓ Copied .next/static -> .next/standalone/.next/static');
  }

  // Copy public
  if (fs.existsSync(publicSrc)) {
    fs.cpSync(publicSrc, publicDest, { recursive: true });
    console.log('✓ Copied public -> .next/standalone/public');
  }

  console.log('🎉 Standalone bundle ready in .next/standalone!');
} else {
  console.warn('⚠️ .next/standalone not found. Did you run next build first?');
}
