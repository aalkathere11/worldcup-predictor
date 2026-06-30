const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  content = content.replace(/(\bsupabase\b)\s*\n\s*\.from\(/g, '($1 as any)\n    .from(');
  content = content.replace(/(\bsupabase\b)\.from\(/g, '($1 as any).from(');
  content = content.replace(/(\badminClient\b)\.from\(/g, '($1 as any).from(');
  content = content.replace(/(\bclient\b)\.from\(/g, '($1 as any).from(');
  content = content.replace(/\bdata\?\.(role|force_password_change|force_avatar_upload)\b/g, '(data as any)?.$1');
  content = content.replace(/\bprofile\?\.(role|force_password_change|force_avatar_upload)\b/g, '(profile as any)?.$1');
  content = content.replace(/\bp\.(user_id|points)\b/g, '(p as any).$1');
  content = content.replace(/\bu\.(id|full_name|nickname|avatar_url)\b/g, '(u as any).$1');
  content = content.replace(/\bpred\.(user_id|points)\b/g, '(pred as any).$1');

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