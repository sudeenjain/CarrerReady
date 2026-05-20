const fs = require('fs');

const files = [
    'pages/Roadmap.tsx',
    'pages/DigitalTwin.tsx',
    'pages/Report.tsx',
    'pages/Onboarding.tsx'
];

const patterns = [
    'bg-indigo-600', 'bg-indigo-500', 'bg-blue-600', 'bg-red-600', 'bg-green-500', 'gradient-bg', 'from-indigo-'
];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    
    // Global replace
    content = content.replace(/text-white/g, 'text-[var(--text-main)] dark:text-white');
    
    // Fix buttons and dark-background elements
    for (const bg of patterns) {
        // bg before text
        const regex1 = new RegExp(`(${bg}[^"'>]*?)text-\\[var\\(--text-main\\)\\] dark:text-white`, 'g');
        content = content.replace(regex1, '$1text-white');
        
        // text before bg
        const regex2 = new RegExp(`text-\\[var\\(--text-main\\)\\] dark:text-white([^"'>]*?${bg})`, 'g');
        content = content.replace(regex2, 'text-white$1');
    }
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed ${file}`);
}
