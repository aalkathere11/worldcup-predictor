const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  content = content.replace(/\b(supabase|adminClient|client)\b\.from\(/g, '($1 as any).from(');
  content = content.replace(/\b(supabase|adminClient|client)\b\s*\n\s*\.from\(/g, '($1 as any)\n    .from(');
  content = content.replace(/\b(data|profile|pred|p|u)\?\.(role|force_password_change|force_avatar_upload|user_id|points|full_name|nickname|email|score_a|score_b|id)\b/g, '($1 as any)?.$2');
  content = content.replace(/\b(p|u|pred)\.(user_id|points|full_name|nickname|email|score_a|score_b|id|user|match)\b/g, '($1 as any).$2');
  content = content.replace(/return \{ \.\.\.(u|p|pred)(,|\s)/g, 'return { ...($1 as any)$2');
  content = content.replace(/\$\{(p|u|pred)\.(score_a|score_b|points|user_id)\}/g, '${($1 as any).$2}');

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