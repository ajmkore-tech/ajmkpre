const fs = require('fs');

// Fix CloseSaleModal
let closeModal = fs.readFileSync('src/components/CloseSaleModal.tsx', 'utf8');
closeModal = closeModal.replace(/import \{ X, CreditCard, DollarSign \} from 'lucide-react';/, "import { X, CreditCard, DollarSign, TrendingUp, CheckCircle2 } from 'lucide-react';");
fs.writeFileSync('src/components/CloseSaleModal.tsx', closeModal);

// Fix NewOrderModal
let newModal = fs.readFileSync('src/components/NewOrderModal.tsx', 'utf8');
newModal = newModal.replace(/canEditPrice\n  } = state;/g, "canEditPrice, companyConfig\n  } = state;");
newModal = newModal.replace(/handleProductSelect\(idx, data\)/g, "handleItemChange(idx, 'codigo', data.codigo)");
newModal = newModal.replace(/updateItem\(/g, "handleItemChange(");
fs.writeFileSync('src/components/NewOrderModal.tsx', newModal);
