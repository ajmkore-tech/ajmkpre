const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventory.tsx', 'utf8');

const importLogic = `
        setInventory(prev => [...prev, ...newProducts]);
        
        // Update inventory config with unique new values from CSV
        const newConfig = { ...(inventoryConfig || {marcasRepuesto:[],marcasVehiculo:[],lineas:[],tiposRepuesto:[]}) };
        let configChanged = false;
        
        const newMarcasRepuesto = new Set(newProducts.map(p => p.marcaRepuesto).filter(Boolean));
        const newMarcasVehiculo = new Set(newProducts.map(p => p.marcaVehiculo).filter(Boolean));
        const newLineas = new Set(newProducts.map(p => p.linea).filter(Boolean));
        const newTiposRepuesto = new Set(newProducts.map(p => p.tipoRepuesto).filter(Boolean));

        newMarcasRepuesto.forEach(val => { if (!newConfig.marcasRepuesto.includes(val)) { newConfig.marcasRepuesto.push(val); configChanged = true; } });
        newMarcasVehiculo.forEach(val => { if (!newConfig.marcasVehiculo.includes(val)) { newConfig.marcasVehiculo.push(val); configChanged = true; } });
        newLineas.forEach(val => { if (!newConfig.lineas.includes(val)) { newConfig.lineas.push(val); configChanged = true; } });
        newTiposRepuesto.forEach(val => { if (!newConfig.tiposRepuesto.includes(val)) { newConfig.tiposRepuesto.push(val); configChanged = true; } });
        
        if (configChanged) {
          setInventoryConfig(newConfig);
        }
`;

if (!code.includes('const newMarcasRepuesto = new Set(newProducts')) {
  code = code.replace('setInventory(prev => [...prev, ...newProducts]);', importLogic);
  fs.writeFileSync('src/pages/Inventory.tsx', code);
  console.log('Inventory csv import patched');
} else {
  console.log('Already patched');
}
