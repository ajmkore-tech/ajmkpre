const fs = require('fs');

// 1. Fix Compras.tsx
let compras = fs.readFileSync('src/pages/Compras.tsx', 'utf8');
compras = compras.replace(/item\.cantidad - item\.recibido/g, 'item.cantidadPedida - item.cantidadRecibida');
compras = compras.replace(/item\.cantidad/g, 'item.cantidadPedida');
compras = compras.replace(/item\.recibido/g, 'item.cantidadRecibida');

// Expense condicionPago
compras = compras.replace(/condicionPago:\s*'Contado',/g, ''); // Wait, does Expense have condicionPago? Let's check Expense type.
fs.writeFileSync('src/pages/Compras.tsx', compras);
