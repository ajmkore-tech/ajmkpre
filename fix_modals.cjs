const fs = require('fs');

// Fix CloseSaleModal
let closeModal = fs.readFileSync('src/components/CloseSaleModal.tsx', 'utf8');
closeModal = closeModal.replace(/minoristaRate/g, 'state.minoristaRate');
closeModal = closeModal.replace("import { X, DollarSign } from 'lucide-react';", "import { X, DollarSign, TrendingUp, CheckCircle2 } from 'lucide-react';");
fs.writeFileSync('src/components/CloseSaleModal.tsx', closeModal);

// Fix NewOrderModal
let newModal = fs.readFileSync('src/components/NewOrderModal.tsx', 'utf8');
newModal = newModal.replace("import Autocomplete from '../Autocomplete';", "import Autocomplete from './Autocomplete';");
newModal = newModal.replace("import Combobox from '../Combobox';", "import Combobox from './Combobox';");
newModal = newModal.replace(/handleClientRifSearch/g, 'state.handleClientRifSearch');
newModal = newModal.replace(/handleClientSelect/g, 'state.handleClientSelect');
newModal = newModal.replace(/handleTipoPrecioChange/g, 'state.handleTipoPrecioChange');
newModal = newModal.replace(/userRole/g, 'state.userRole');
fs.writeFileSync('src/components/NewOrderModal.tsx', newModal);
