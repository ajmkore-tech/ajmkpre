const fs = require('fs');
let code = fs.readFileSync('src/pages/Configuracion.tsx', 'utf8');

code = code.replace(
  'reportes: false',
  'reportes: false'
);

// If it's missing entirely in the setRoles
code = code.replace(
  "ventas: false, clientes: false, compras: false, cxc: false, cxp: false, configuracion: false }",
  "ventas: false, clientes: false, compras: false, cxc: false, cxp: false, configuracion: false, reportes: false }"
);

fs.writeFileSync('src/pages/Configuracion.tsx', code);
