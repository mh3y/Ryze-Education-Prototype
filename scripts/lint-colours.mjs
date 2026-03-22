import { readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

// Ban specific Tailwind colour utility classes from being hardcoded.
const BANNED_REGEX = /\b(text|bg|border)-(white|black|gray|zinc|neutral|slate|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(-\d{2,3})?\b|text-white\/(?:[0-9]+)\b/;

function skipList(path) {
  return path.includes('node_modules') || path.includes('dist') || path.endsWith('.min.js');
}

function processDirectory(directory) {
  let hasErrors = false;
  const files = readdirSync(directory);
  
  for (const file of files) {
    const fullPath = join(directory, file);
    if (skipList(fullPath)) continue;
    
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      hasErrors = processDirectory(fullPath) || hasErrors;
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
      const content = readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        const match = line.match(BANNED_REGEX);
        if (match) {
          // Exceptions for semantic colours AND structural overlays (white/black opacities)
          const matchedText = match[0];
          
          if ((matchedText.includes('red') || matchedText.includes('green') || matchedText.includes('emerald')) && 
              (line.includes('error') || line.includes('success') || line.includes('What We Are') || line.includes('What We\'re Not') || line.toLowerCase().includes('problem'))) {
            return;
          }
          if ((matchedText.includes('white') || matchedText.includes('black')) && matchedText.includes('/')) {
            // Allow structural glassmorphism/overlays like bg-black/60 or border-white/10
            return;
          }
          if (matchedText === 'text-white' && line.includes('isSolid')) {
            // Allow dynamic transparency logic in Navbar
            return;
          }

          console.error(`\x1b[31mError:\x1b[0m Hardcoded Tailwind colour class found in ${fullPath}:${index + 1}`);
          console.error(`  --> \x1b[33m${line.trim()}\x1b[0m`);
          console.error(`  Match: \x1b[31m${match[0]}\x1b[0m\n`);
          hasErrors = true;
        }
      });
    }
  }
  return hasErrors;
}

const dirsToCheck = ['pages', 'components'];
let overallError = false;

dirsToCheck.forEach(dir => {
  console.log(`\x1b[36mScanning directory:\x1b[0m ${dir}`);
  const hasErrors = processDirectory(dir);
  overallError = overallError || hasErrors;
});

if (overallError) {
  console.error('\n\x1b[31m[Lint Failed]\x1b[0m Hardcoded Tailwind colour classes detected. Please replace them with semantic `.ryze-*` tokens.');
  process.exit(1);
} else {
  console.log('\n\x1b[32m[Lint Passed]\x1b[0m No banned colour classes found. Perfect!');
  process.exit(0);
}
