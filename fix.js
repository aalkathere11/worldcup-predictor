const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  content = content.replace(/await supabase\.from\(/g, 'await (supabase as any).from(');
  content = content.replace(/await adminClient\.from\(/g, 'await (adminClient as any).from(');
  content = content.replace(/await client\.from\(/g, 'await (client as any).from(');
  content = content.replace(/data\?\.role/g, '(data as any)?.role');
  content = content.replace(/profile\?\.force/g, '(profile as any)?.force');
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed:', filePath);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fixFile(fullPath);
    }
  });
}

walkDir('src');
console.log('Done!');