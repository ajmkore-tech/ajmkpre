const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const typeStart = content.indexOf('interface ExchangeRates {');
const typeEnd = content.indexOf('export const defaultInventoryConfig: InventoryConfig = {');

if (typeStart > -1 && typeEnd > -1) {
    const replacement = `import {
  ExchangeRates, Role, SaleStatus, SaleItem, Sale, Client, Provider,
  InventoryConfig, Product, Receipt, PaymentMethod, PurchaseStatus,
  PaymentRecord, PurchaseItem, Purchase, Expense, CompanyConfig,
  SequencesConfig
} from '../types';

`;
    content = content.substring(0, typeStart) + replacement + content.substring(typeEnd);
    fs.writeFileSync('src/context/AppContext.tsx', content);
    console.log("Replaced types in AppContext.tsx");
}
