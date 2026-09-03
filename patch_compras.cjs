const fs = require('fs');
let code = fs.readFileSync('src/pages/Compras.tsx', 'utf8');

code = code.replace(
  'const invMap = new Map(inventory.map(p => [p.codigo, p]));',
  'const invMap = new Map<string, Product>(inventory.map(p => [p.codigo, p]));'
);

fs.writeFileSync('src/pages/Compras.tsx', code);
