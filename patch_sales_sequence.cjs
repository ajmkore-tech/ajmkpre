const fs = require('fs');
let code = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

// 1. Fix the Search logic to include numeroDocumento
const oldSearch = `      result = result.filter(s => 
        normalizeSearch(s.id).includes(lowerSearch) || 
        normalizeSearch(s.clienteNombre).includes(lowerSearch)
      );`;

const newSearch = `      result = result.filter(s => 
        normalizeSearch(s.id).includes(lowerSearch) || 
        normalizeSearch(s.clienteNombre).includes(lowerSearch) ||
        (s.numeroDocumento && normalizeSearch(s.numeroDocumento).includes(lowerSearch))
      );`;

code = code.replace(oldSearch, newSearch);

// 2. Fix the Order ID generation
const oldGeneration = `    } else {
      const newSale: Sale = {
        id: \`PED-\${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}\`,`;

const newGeneration = `    } else {
      const prefixPrecio = tipoPrecio === 'Mayorista' ? 'MA' : 'MI';
      const prefixPago = condicionPago === 'Contado' ? 'CO' : 'CR';
      const nextIdNumber = sequencesConfig.pedido || 1;
      const generatedId = \`\${prefixPrecio}\${prefixPago}\${nextIdNumber.toString().padStart(5, '0')}\`;
      
      setSequencesConfig(prev => ({ ...prev, pedido: nextIdNumber + 1 }));

      const newSale: Sale = {
        id: generatedId,`;

code = code.replace(oldGeneration, newGeneration);

fs.writeFileSync('src/pages/Sales.tsx', code);
