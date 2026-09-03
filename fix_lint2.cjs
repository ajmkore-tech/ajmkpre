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
  appCtx = appCtx.replace('interface AppContextType', defaultInvConfig + 'interface AppContextType');
}
fs.writeFileSync('src/context/AppContext.tsx', appCtx);

// 2. Compras.tsx
let compras = fs.readFileSync('src/pages/Compras.tsx', 'utf8');
if (!compras.includes('AlertCircle')) {
  compras = compras.replace('import { Search, Plus, Filter, Package, DollarSign, Edit, Trash2, ArrowRight, X, FileText, CheckCircle2, Truck, ClipboardList } from \'lucide-react\';', 'import { Search, Plus, Filter, Package, DollarSign, Edit, Trash2, ArrowRight, X, FileText, CheckCircle2, Truck, ClipboardList, AlertCircle } from \'lucide-react\';');
}
fs.writeFileSync('src/pages/Compras.tsx', compras);

console.log('Fixed');
