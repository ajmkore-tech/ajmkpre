const fs = require('fs');

const appCtxPath = 'src/context/AppContext.tsx';
let appCtx = fs.readFileSync(appCtxPath, 'utf8');

const typeStart = appCtx.indexOf('interface ExchangeRates {');
const typeEnd = appCtx.indexOf('export const defaultInventoryConfig: InventoryConfig = {');

const typesContent = appCtx.substring(typeStart, typeEnd);
console.log(typesContent.substring(0, 500));
console.log('...');
console.log(typesContent.substring(typesContent.length - 500));
