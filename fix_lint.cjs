const fs = require('fs');

// 1. AppContext.tsx
let appCtx = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
const defaultInvConfig = `export const defaultInventoryConfig: InventoryConfig = {
  marcasRepuesto: [],
  marcasVehiculo: [],
  lineas: [],
  tiposRepuesto: []
};\n\n`;

if (!appCtx.includes('export const defaultInventoryConfig')) {
  appCtx = appCtx.replace('export interface AppContextType', defaultInvConfig + 'export interface AppContextType');
}
fs.writeFileSync('src/context/AppContext.tsx', appCtx);

// 2. Compras.tsx
let compras = fs.readFileSync('src/pages/Compras.tsx', 'utf8');
if (!compras.includes('AlertCircle')) {
  compras = compras.replace('import { Search, Plus, Filter, Package, DollarSign, Edit, Trash2, ArrowRight, X, FileText, CheckCircle2, Truck, ClipboardList } from \'lucide-react\';', 'import { Search, Plus, Filter, Package, DollarSign, Edit, Trash2, ArrowRight, X, FileText, CheckCircle2, Truck, ClipboardList, AlertCircle } from \'lucide-react\';');
}
if (!compras.includes('Product }')) {
  compras = compras.replace('import { useAppContext, Purchase, Expense, PurchaseItem, PurchaseStatus } from \'../context/AppContext\';', 'import { useAppContext, Purchase, Expense, PurchaseItem, PurchaseStatus, Product } from \'../context/AppContext\';');
}
fs.writeFileSync('src/pages/Compras.tsx', compras);

// 3. Configuracion.tsx
let config = fs.readFileSync('src/pages/Configuracion.tsx', 'utf8');
config = config.replace('configuracion: false,', 'configuracion: false,\n        reportes: false,');
fs.writeFileSync('src/pages/Configuracion.tsx', config);

console.log('Fixed');
