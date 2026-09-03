const fs = require('fs');
let code = fs.readFileSync('src/pages/Compras.tsx', 'utf8');

const oldSave3 = `const validItems = purchaseItems.filter(i => i.codigo && i.cantidad > 0 && i.costoUnitario > 0);`;
const newSave3 = `const validItems = purchaseItems.filter(i => i.codigo && (i.cantidadPedida || 0) > 0 && i.costoUnitario > 0);`;

code = code.replace(oldSave3, newSave3);

fs.writeFileSync('src/pages/Compras.tsx', code);
