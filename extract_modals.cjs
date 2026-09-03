const fs = require('fs');

function getBracketMatch(str, startIdx) {
    let count = 0;
    for (let i = startIdx; i < str.length; i++) {
        if (str[i] === '(') count++;
        if (str[i] === ')') {
            count--;
            if (count === 0) return i;
        }
    }
    return -1;
}

let content = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

const modal1Start = content.indexOf('{isModalOpen && (');
const modal1Paren = content.indexOf('(', modal1Start);
const modal1End = getBracketMatch(content, modal1Paren);

const modal1JSX = content.substring(modal1Paren + 1, modal1End);

const modal1Component = `import React from 'react';
import { Search, Plus, FileEdit, Trash2, CheckCircle2, Truck, DollarSign, ArrowRight, ArrowLeft, X, User, Clock, ChevronDown, Tag, MapPin, CreditCard, TrendingUp, FileText } from 'lucide-react';
import Autocomplete from '../Autocomplete';

export default function NewOrderModal({ state }: { state: any }) {
  const {
    isModalOpen, setIsModalOpen, editingSaleId, setEditingSaleId,
    orderClient, setOrderClient, orderItems, setOrderItems,
    tipoUbicacion, setTipoUbicacion, condicionPago, setCondicionPago,
    tipoPrecio, setTipoPrecio, orderRate, setOrderRate, orderCurrency, setOrderCurrency,
    tipoDocumento, setTipoDocumento, handleSaveOrder, calculateBs, clients, inventory,
    minoristaRate, activeRate, rates, formatBs, handleItemChange, handleAddItem, handleRemoveItem, canEditPrice
  } = state;

  return (
    ${modal1JSX}
  );
}
`;

fs.writeFileSync('src/components/NewOrderModal.tsx', modal1Component);

const modal2Start = content.indexOf('{isClosingModalOpen && closingSale && (');
const modal2Paren = content.indexOf('(', modal2Start);
const modal2End = getBracketMatch(content, modal2Paren);

const modal2JSX = content.substring(modal2Paren + 1, modal2End);

const modal2Component = `import React from 'react';
import { X, CreditCard, DollarSign } from 'lucide-react';

export default function CloseSaleModal({ state }: { state: any }) {
  const {
    isClosingModalOpen, setIsClosingModalOpen, closingSale, setClosingSale,
    closingData, setClosingData, closingError, setClosingError, handleCloseSaleSubmit,
    rates, activeRate, formatBs, companyConfig
  } = state;

  return (
    ${modal2JSX}
  );
}
`;

fs.writeFileSync('src/components/CloseSaleModal.tsx', modal2Component);

// Now replace in Sales.tsx
let newContent = content.substring(0, modal1Start) + 
                 "{isModalOpen && <NewOrderModal state={modalState} />}\n      " + 
                 content.substring(modal1End + 1, modal2Start) + 
                 "{isClosingModalOpen && closingSale && <CloseSaleModal state={modalState} />}\n      " + 
                 content.substring(modal2End + 1);

// Inject modalState right before return
const returnStart = newContent.indexOf('  return (\n    <div className="h-full flex flex-col bg-[#F8FAFC]">');
const modalStateStr = `
  const modalState = {
    isModalOpen, setIsModalOpen, editingSaleId, setEditingSaleId,
    orderClient, setOrderClient, orderItems, setOrderItems,
    tipoUbicacion, setTipoUbicacion, condicionPago, setCondicionPago,
    tipoPrecio, setTipoPrecio, orderRate, setOrderRate, orderCurrency, setOrderCurrency,
    tipoDocumento, setTipoDocumento, handleSaveOrder, calculateBs, clients, inventory,
    minoristaRate, activeRate, rates, formatBs, handleItemChange, handleAddItem, handleRemoveItem, canEditPrice,
    isClosingModalOpen, setIsClosingModalOpen, closingSale, setClosingSale,
    closingData, setClosingData, closingError, setClosingError, handleCloseSaleSubmit,
    companyConfig
  };

`;

newContent = newContent.substring(0, returnStart) + modalStateStr + newContent.substring(returnStart);

// add imports
const lastImportIndex = newContent.lastIndexOf('import ');
const endOfLastImport = newContent.indexOf(';', lastImportIndex) + 1;
newContent = newContent.substring(0, endOfLastImport) + 
                  "\nimport NewOrderModal from '../components/NewOrderModal';\nimport CloseSaleModal from '../components/CloseSaleModal';" + 
                  newContent.substring(endOfLastImport);

fs.writeFileSync('src/pages/Sales.tsx', newContent);
console.log("Extracted modals for Sales!");
