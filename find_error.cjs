const fs = require('fs');
const content = fs.readFileSync('src/pages/Sales.tsx', 'utf8');
const errIdx = 19067;
console.log(content.substring(errIdx - 50, errIdx + 50));
