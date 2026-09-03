const fs = require('fs');

// Fix the hook
let hookContent = fs.readFileSync('src/hooks/useDocumentGenerator.ts', 'utf8');
hookContent = hookContent.replace(
    'const { formatBs, companyConfig, sequencesConfig, setSequencesConfig, setSales, sales } = useAppContext();',
    'const { formatBs, companyConfig, sequencesConfig, setSequencesConfig, setSales, sales, clients, receipts, minoristaRate, activeRate, rates } = useAppContext();'
);
fs.writeFileSync('src/hooks/useDocumentGenerator.ts', hookContent);

// Fix Sales.tsx
let salesContent = fs.readFileSync('src/pages/Sales.tsx', 'utf8');
salesContent = salesContent.replace(/generateDocument\(sale\)/g, "generateDocument(sale, selectedSale, setSelectedSale)");
fs.writeFileSync('src/pages/Sales.tsx', salesContent);

console.log("Fixes applied!");
