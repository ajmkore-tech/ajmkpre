const fs = require('fs');

// 1. Fix Compras.tsx
let compras = fs.readFileSync('src/pages/Compras.tsx', 'utf8');
compras = compras.replace(/cantidadPedidaPedida/g, 'cantidadPedida');
compras = compras.replace(/cantidadPedidaRecibida/g, 'cantidadRecibida');
fs.writeFileSync('src/pages/Compras.tsx', compras);

// 2. Fix src/types/index.ts
let types = fs.readFileSync('src/types/index.ts', 'utf8');
types = types.replace(/referencia\?: string;\n  id\?: string;\n  modelo\?: string;/, "referencia?: string;\n  modelo?: string;");

const paymentRecordIndex = types.indexOf('export interface PaymentRecord {');
if (paymentRecordIndex > -1) {
    const end = types.indexOf('}', paymentRecordIndex);
    let recordStr = types.substring(paymentRecordIndex, end + 1);
    if (!recordStr.includes('id?: string;')) {
        recordStr = recordStr.replace('referencia?: string;', 'referencia?: string;\n  id?: string;');
        types = types.substring(0, paymentRecordIndex) + recordStr + types.substring(end + 1);
    }
}
fs.writeFileSync('src/types/index.ts', types);
