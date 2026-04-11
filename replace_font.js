const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.css') || fullPath.endsWith('.svg')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('Georgia')) {
        const result = content.replace(/Georgia/g, 'Outfit');
        fs.writeFileSync(fullPath, result, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(path.resolve(__dirname, 'apps/game-web/src'));
console.log("Done.");
