const fs = require('fs');
let lines = fs.readFileSync('src/pages/Sales.tsx', 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("            `}") && lines[i-1].includes("hover:bg-gray-50")) {
    lines[i] = "                  }`}";
  }
}
fs.writeFileSync('src/pages/Sales.tsx', lines.join('\n'));
