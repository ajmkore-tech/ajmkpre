const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventory.tsx', 'utf8');

code = code.replace(
  /<input\s*type="number" step="0\.001" min="0" required\s*value=\{newProduct\.ultimoCosto \|\| newProduct\.costoDolar \|\| ''\}\s*onChange=\{e => \{/g,
  `<input 
                          type="number" step="0.001" min="0" required
                          disabled={!userRole.permissions.inventario.editarCostos}
                          value={newProduct.ultimoCosto || newProduct.costoDolar || ''} 
                          onChange={e => {`
);

code = code.replace(
  /<input\s*type="number" step="0\.001" min="0" required\s*value=\{newProduct\.costoPromedio \|\| ''\}\s*onChange=\{e => \{/g,
  `<input 
                          type="number" step="0.001" min="0" required
                          disabled={!userRole.permissions.inventario.editarCostos}
                          value={newProduct.costoPromedio || ''} 
                          onChange={e => {`
);

// also apply to the visual class to make it look disabled
code = code.replace(
  /className="w-full p-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-\[#2563EB\]\/20"/g,
  `className={\`w-full p-2 border border-gray-200 rounded-lg text-xs font-bold \${!userRole.permissions.inventario.editarCostos ? 'text-gray-500 bg-gray-100 cursor-not-allowed' : 'text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20'}\`}`
);

fs.writeFileSync('src/pages/Inventory.tsx', code);
