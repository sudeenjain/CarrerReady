import fs from 'fs';
import path from 'path';

const directories = [
  'e:/Projects/CarrerReady/CarrerReady/pages',
  'e:/Projects/CarrerReady/CarrerReady/components'
];

const replacements = [
  { regex: /bg-slate-900\s+rounded-\[40px\]\s+p-10/g, replacement: 'bg-[var(--glass-bg)] rounded-[40px] p-10' },
  { regex: /bg-slate-900\s+rounded-\[32px\]\s+p-8/g, replacement: 'bg-[var(--glass-bg)] rounded-[32px] p-8' },
  { regex: /bg-slate-900\s+dark:bg-slate-950\s+rounded-\[32px\]\s+p-8/g, replacement: 'bg-[var(--glass-bg)] rounded-[32px] p-8' },
  { regex: /bg-slate-900\s+rounded-3xl\s+p-6/g, replacement: 'bg-[var(--glass-bg)] rounded-3xl p-6' },
  { regex: /bg-slate-900\s+rounded-[2xl|3xl|lg]/g, replacement: 'bg-[var(--glass-bg)] rounded-2xl' },
  { regex: /p-6\s+bg-slate-900/g, replacement: 'p-6 bg-[var(--glass-bg)]' },
  { regex: /bg-slate-900\/80/g, replacement: 'bg-black/30 dark:bg-black/60' },
  { regex: /bg-slate-900\/60/g, replacement: 'bg-black/20 dark:bg-black/50' },
  { regex: /border-white\/5/g, replacement: 'border-[var(--border-color)]' },
  { regex: /border-white\/10/g, replacement: 'border-[var(--border-color)]' },
  { regex: /text-white\s+shadow-2xl/g, replacement: 'text-[var(--text-main)] shadow-2xl' },
  { regex: /bg-slate-900\s+text-white/g, replacement: 'bg-[var(--bg-card)] text-[var(--text-main)]' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Modified: ${fullPath}`);
      }
    }
  }
}

directories.forEach(processDirectory);
console.log('Refactoring complete.');
