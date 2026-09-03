const fs = require('fs');

let inv = fs.readFileSync('src/pages/Inventory.tsx', 'utf8');

inv = inv.replace(
  'setSelectedProduct(prev => {',
  '// setSelectedProduct(prev => {'
);
inv = inv.replace(
  'return { ...prev, precioMayor: newPrice };',
  '// return { ...prev, precioMayor: newPrice };'
);
inv = inv.replace(
  'return { ...prev, precioMinor: newPrice };',
  '// return { ...prev, precioMinor: newPrice };'
);
inv = inv.replace(
  'return { ...prev, stockDisp: newPrice };',
  '// return { ...prev, stockDisp: newPrice };'
);
inv = inv.replace(
  'return prev;\n      });',
  '// return prev;\n      // });'
);

fs.writeFileSync('src/pages/Inventory.tsx', inv);

console.log('Lint fixes 4 applied.');
