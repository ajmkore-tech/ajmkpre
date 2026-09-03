const fs = require('fs');
let code = fs.readFileSync('src/pages/Compras.tsx', 'utf8');

code = code.replace(
  /inventory\.filter\(p => p\.codigo\.includes\(item\.codigo\.toUpperCase\(\)\) \|\| p\.detalle\.includes\(item\.codigo\.toUpperCase\(\)\)\)/g,
  "inventory.filter(p => p.codigo.toUpperCase().includes((item.codigo || '').toUpperCase()) || p.detalle.toUpperCase().includes((item.codigo || '').toUpperCase()))"
);

code = code.replace(
  /inventory\.filter\(p => p\.codigo\.includes\(item\.detalle\.toUpperCase\(\)\) \|\| p\.detalle\.includes\(item\.detalle\.toUpperCase\(\)\)\)/g,
  "inventory.filter(p => p.codigo.toUpperCase().includes((item.detalle || '').toUpperCase()) || p.detalle.toUpperCase().includes((item.detalle || '').toUpperCase()))"
);

fs.writeFileSync('src/pages/Compras.tsx', code);
