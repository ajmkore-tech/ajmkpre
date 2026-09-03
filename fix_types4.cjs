const fs = require('fs');

let types = fs.readFileSync('src/types/index.ts', 'utf8');

const paymentRecordIndex = types.indexOf('export interface PaymentRecord {');
if (paymentRecordIndex > -1) {
    const end = types.indexOf('}', paymentRecordIndex);
    let recordStr = types.substring(paymentRecordIndex, end + 1);
    if (!recordStr.includes('tasa?: number;')) {
        recordStr = recordStr.replace('referencia?: string;', 'referencia?: string;\n  tasa?: number;');
        types = types.substring(0, paymentRecordIndex) + recordStr + types.substring(end + 1);
    }
}
fs.writeFileSync('src/types/index.ts', types);
