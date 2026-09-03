const fs = require('fs');
let code = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

code = code.replace(
    /const \{ sales, setSales, canEditPrice, clients, receipts, setClients, inventory, setInventory, userRole, formatBs, activeRate, minoristaRate, useSeparateMinoristaRate, rates, calculateBs, companyConfig, sequencesConfig, setSequencesConfig \} = useAppContext\(\);/,
    "const { sales, setSales, clients, receipts, setClients, inventory, setInventory, userRole, formatBs, activeRate, minoristaRate, useSeparateMinoristaRate, rates, calculateBs, companyConfig, sequencesConfig, setSequencesConfig } = useAppContext();\n  const canEditPrice = userRole.permissions.ventas.editarPrecio;"
);

fs.writeFileSync('src/pages/Sales.tsx', code);
