const fs = require('fs');

let types = fs.readFileSync('src/types/index.ts', 'utf8');

// Add to Expense
types = types.replace(/concepto: string;/, "concepto: string;\n  condicionPago?: 'Contado' | 'Crédito';\n  proveedorNombre?: string;\n  diasCredito?: number;");

// Add to Purchase
types = types.replace(/proveedorNombre: string;/, "proveedorNombre: string;\n  numeroFactura?: string;\n  condicionPago?: 'Contado' | 'Crédito';\n  diasCredito?: number;");

// Add to PaymentRecord
types = types.replace(/referencia\?: string;/, "referencia?: string;\n  id?: string;");

fs.writeFileSync('src/types/index.ts', types);
console.log('Fixed types');
