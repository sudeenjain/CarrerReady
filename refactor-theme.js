import fs from 'fs';
import path from 'path';

const directories = [
  'e:/Projects/CarrerReady/CarrerReady/pages',
  'e:/Projects/CarrerReady/CarrerReady/components'
];

const replacements = [
  { regex: /bg-slate-50\s+dark:bg-slate-950/g, replacement: 'bg-[var(--bg-main)] text-[var(--text-main)]' },
  { regex: /bg-white\s+dark:bg-slate-900/g, replacement: 'bg-[var(--bg-card)]' },
  { regex: /border-slate-100\s+dark:border-slate-800/g, replacement: 'border-[var(--border-color)]' },
  { regex: /border-slate-200\s+dark:border-slate-700/g, replacement: 'border-[var(--border-color)]' },
  { regex: /text-slate-900\s+dark:text-white/g, replacement: 'text-[var(--text-main)]' },
  { regex: /text-slate-800\s+dark:text-white/g, replacement: 'text-[var(--text-main)]' },
  { regex: /text-slate-700\s+dark:text-slate-300/g, replacement: 'text-[var(--text-main)]' },
  { regex: /text-slate-600\s+dark:text-slate-400/g, replacement: 'text-[var(--text-muted)]' },
  { regex: /text-slate-500\s+dark:text-slate-400/g, replacement: 'text-[var(--text-muted)]' },
  { regex: /text-slate-400\s+dark:text-slate-600/g, replacement: 'text-[var(--text-muted)]' },
  { regex: /bg-slate-100\s+dark:bg-slate-800/g, replacement: 'bg-[var(--input-bg)]' },
  { regex: /bg-slate-50\s+dark:bg-slate-800\/60/g, replacement: 'bg-[var(--input-bg)]' },
  { regex: /border-slate-100\s+dark:border-slate-700\/60/g, replacement: 'border-[var(--input-border)]' },
  { regex: /text-slate-900\s+dark:text-slate-100/g, replacement: 'text-[var(--text-main)]' },
  { regex: /placeholder:text-slate-400\s+dark:placeholder:text-slate-500/g, replacement: 'placeholder:text-[var(--text-muted)]' },
  { regex: /bg-\[#1f2937\]\s+text-white\s+rounded-lg\s+border\s+border-\[#374151\]/g, replacement: 'bg-indigo-600 text-white rounded-xl border border-indigo-500/20' },
  { regex: /hover:bg-\[#111827\]/g, replacement: 'hover:bg-indigo-700' },
  { regex: /bg-\[#1f2937\]/g, replacement: 'bg-[var(--glass-bg)] text-[var(--text-main)]' },
  { regex: /border-\[#374151\]/g, replacement: 'border-[var(--border-color)]' },
  { regex: /bg-\[#111827\]/g, replacement: 'bg-[var(--input-bg)]' },
  { regex: /text-gray-400/g, replacement: 'text-[var(--text-muted)]' },
  { regex: /bg-gray-700/g, replacement: 'bg-[var(--input-bg)]' },
  { regex: /text-slate-300\s+dark:text-slate-600/g, replacement: 'text-[var(--text-muted)]' },
  { regex: /text-slate-300\s+dark:text-slate-700/g, replacement: 'text-[var(--text-muted)]' }
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
