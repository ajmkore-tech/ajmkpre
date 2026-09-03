const fs = require('fs');

let inv = fs.readFileSync('src/pages/Inventory.tsx', 'utf8');

inv = inv.replace(
  '// setSelectedProduct(prev => {\n        if (!prev) return null;\n        const field = editingPrice === \'mayor\' ? \'precioMayor\' : (editingPrice === \'minor\' ? \'precioMinor\' : \'stockDisp\');\n        return { ...prev, [field]: newPrice };\n      });',
  ''
);

fs.writeFileSync('src/pages/Inventory.tsx', inv);
console.log('Lint fixes 5 applied.');
