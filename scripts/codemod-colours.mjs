import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

function skipList(path) {
  return path.includes('node_modules') || path.includes('dist') || path.endsWith('.min.js') || path.includes('PrimaryCTA') || path.includes('StickyMobileCTA');
}

const map = {
  'text-white': 'ryze-text-inverse',
  'text-[var(--primary-foreground)]': 'ryze-text-inverse',
  'text-black': 'ryze-text-primary',
  'text-[var(--text)]': 'ryze-text-primary',
  'text-[var(--primary)]': 'ryze-text-primary',
  'text-slate-900': 'ryze-text-primary',
  'text-slate-800': 'ryze-text-primary',
  'text-slate-700': 'ryze-text-secondary',
  'text-slate-600': 'ryze-text-secondary',
  'text-slate-500': 'ryze-text-muted',
  'text-slate-400': 'ryze-text-muted',
  'text-slate-300': 'ryze-text-inverse-muted',
  'text-gray-900': 'ryze-text-primary',
  'text-gray-800': 'ryze-text-primary',
  'text-gray-700': 'ryze-text-secondary',
  'text-gray-600': 'ryze-text-secondary',
  'text-gray-500': 'ryze-text-muted',
  'text-gray-400': 'ryze-text-muted',
  'text-gray-300': 'ryze-text-inverse-muted',
  'text-[var(--muted)]': 'ryze-text-secondary',
  
  'bg-gray-50': 'ryze-bg-surface',
  'bg-gray-100': 'ryze-bg-surface',
  'bg-gray-800': 'ryze-bg-surface-dark',
  'bg-gray-900': 'ryze-bg-surface-dark',
  'bg-slate-50': 'ryze-bg-surface',
  'bg-slate-100': 'ryze-bg-surface',
  'bg-slate-800': 'ryze-bg-surface-dark',
  'bg-slate-900': 'ryze-bg-surface-dark',
  'bg-[var(--surface)]': 'ryze-bg-surface',
  'bg-[var(--bg)]': 'ryze-bg-primary',
  'bg-[var(--primary)]': 'ryze-bg-surface-dark',
  
  'border-[var(--border)]': 'ryze-border-subtle',
  'border-[rgba(23,29,40,0.12)]': 'ryze-border-subtle'
};

function processDirectory(directory) {
  const files = readdirSync(directory);
  
  for (const file of files) {
    const fullPath = join(directory, file);
    if (skipList(fullPath)) continue;
    
    if (statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.jsx')) {
      let content = readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // Regex replace bounded by word boundaries or quotes
      for (const [key, value] of Object.entries(map)) {
        // Need to properly escape regex for brackets
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Match string followed by non-word or space/quote boundary to handle Tailwind classes effectively
        const regex = new RegExp(`(?<=\\s|["'\`|:])${escapedKey}(?=\\s|["'\`])`, 'g');
        content = content.replace(regex, value);
      }
      
      // Special case for opacity hacks e.g. text-white/70
      content = content.replace(/text-white\/\d+/g, 'ryze-text-inverse-muted');
      content = content.replace(/text-black\/\d+/g, 'ryze-text-secondary');
      
      if (content !== originalContent) {
        writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

['pages', 'components'].forEach(dir => processDirectory(dir));
