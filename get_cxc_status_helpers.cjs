const fs = require('fs');
let code = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

// I need the getStatusColor and getStatusIcon from Sales.tsx to use in CxC.tsx
const match = code.match(/const getStatusColor =.*?\}\;/s);
if (match) {
  fs.writeFileSync('status_helpers.txt', match[0]);
}

const match2 = code.match(/const getStatusIcon =.*?\}\;/s);
if (match2) {
  fs.appendFileSync('status_helpers.txt', '\n' + match2[0]);
}
