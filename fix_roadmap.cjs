const fs = require('fs');
let content = fs.readFileSync('pages/Roadmap.tsx', 'utf8');
content = content.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('pages/Roadmap.tsx', content);
