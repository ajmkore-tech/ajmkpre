const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf8');

code = code.replace(
  'inventario: {\n      verCostosUtilidad: boolean;\n    }',
  'inventario: {\n      verCostosUtilidad: boolean;\n      editarCostos?: boolean;\n    }'
);

fs.writeFileSync('src/types/index.ts', code);
