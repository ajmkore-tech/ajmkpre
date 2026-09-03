const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  '  montoPagado?: number;',
  '  montoPagado?: number;\n  esEmpaque?: boolean;\n  empaqueBase?: string;'
);

fs.writeFileSync('src/context/AppContext.tsx', code);
