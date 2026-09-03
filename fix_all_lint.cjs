const fs = require('fs');

// 1. AppContext.tsx
let appCtx = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
const defaultConfigStr = `export const defaultInventoryConfig: InventoryConfig = {
  marcasRepuesto: [],
  marcasVehiculo: [],
  lineas: [],
  tiposRepuesto: []
};`;

if (appCtx.includes(defaultConfigStr)) {
    appCtx = appCtx.replace(defaultConfigStr, ''); // remove it from current location
}
if (!appCtx.includes('export const defaultInventoryConfig')) {
  appCtx = appCtx.replace('export interface AppContextType', defaultConfigStr + '\n\nexport interface AppContextType');
}
fs.writeFileSync('src/context/AppContext.tsx', appCtx);

// 2. Compras.tsx
let compras = fs.readFileSync('src/pages/Compras.tsx', 'utf8');
if (!compras.includes('AlertCircle')) {
    compras = compras.replace(/import \{ Plus, Search, FileEdit, Trash2, CheckCircle2, ChevronDown \} from 'lucide-react';/, "import { Plus, Search, FileEdit, Trash2, CheckCircle2, ChevronDown, AlertCircle } from 'lucide-react';");
}
if (!compras.includes('import { useAppContext, Purchase, PurchaseItem, Product }')) {
    compras = compras.replace(/import \{ useAppContext, Purchase, PurchaseItem \} from '\.\.\/context\/AppContext';/, "import { useAppContext, Purchase, PurchaseItem, Product } from '../context/AppContext';");
}
fs.writeFileSync('src/pages/Compras.tsx', compras);

// 3. Configuracion.tsx
let config = fs.readFileSync('src/pages/Configuracion.tsx', 'utf8');
config = config.replace(
  /ventas: false, clientes: false, compras: false, cxc: false, cxp: false, configuracion: false \}/g,
  "ventas: false, clientes: false, compras: false, cxc: false, cxp: false, configuracion: false, reportes: false }"
);
fs.writeFileSync('src/pages/Configuracion.tsx', config);
console.log("Fixed");
