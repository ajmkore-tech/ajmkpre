const fs = require('fs');
let lines = fs.readFileSync('src/pages/Sales.tsx', 'utf8').split('\n');
lines.splice(176, 0, '      }');
fs.writeFileSync('src/pages/Sales.tsx', lines.join('\n'));
