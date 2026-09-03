const fs = require('fs');

let compras = fs.readFileSync('src/pages/Compras.tsx', 'utf8');
compras = compras.replace('import { Search, Plus, Filter, Package, DollarSign, Edit, Trash2, ArrowRight, X, FileText, CheckCircle2, Truck, ClipboardList } from \'lucide-react\';', 'import { Search, Plus, Filter, Package, DollarSign, Edit, Trash2, ArrowRight, X, FileText, CheckCircle2, Truck, ClipboardList, AlertCircle } from \'lucide-react\';');
fs.writeFileSync('src/pages/Compras.tsx', compras);
console.log('Fixed');
