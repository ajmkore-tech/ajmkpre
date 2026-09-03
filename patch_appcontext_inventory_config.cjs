const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventory.tsx', 'utf8');

if (!code.includes('inventoryConfig')) {
  code = code.replace('useAppContext();', 'useAppContext();\n  const { inventoryConfig, setInventoryConfig } = useAppContext();');
}

const oldCats = `  const categories = useMemo(() => Array.from(new Set(inventory.map(i => i.marcaRepuesto))), [inventory]);
  const tipos = useMemo(() => Array.from(new Set(inventory.map(i => i.tipoRepuesto))), [inventory]);
  const marcas = useMemo(() => Array.from(new Set(inventory.map(i => i.marcaVehiculo))), [inventory]);
  const lineas = useMemo(() => Array.from(new Set(inventory.map(i => i.linea))), [inventory]);`;

const newCats = `  const categories = useMemo(() => Array.from(new Set([...(inventoryConfig?.marcasRepuesto || []), ...inventory.map(i => i.marcaRepuesto)])).filter(Boolean).sort(), [inventory, inventoryConfig]);
  const tipos = useMemo(() => Array.from(new Set([...(inventoryConfig?.tiposRepuesto || []), ...inventory.map(i => i.tipoRepuesto)])).filter(Boolean).sort(), [inventory, inventoryConfig]);
  const marcas = useMemo(() => Array.from(new Set([...(inventoryConfig?.marcasVehiculo || []), ...inventory.map(i => i.marcaVehiculo)])).filter(Boolean).sort(), [inventory, inventoryConfig]);
  const lineas = useMemo(() => Array.from(new Set([...(inventoryConfig?.lineas || []), ...inventory.map(i => i.linea)])).filter(Boolean).sort(), [inventory, inventoryConfig]);`;

if (code.includes('Array.from(new Set(inventory.map(i => i.marcaRepuesto)))')) {
  code = code.replace(oldCats, newCats);
}

const updateConfigLogic = `
    const newConfig = { ...(inventoryConfig || {marcasRepuesto:[],marcasVehiculo:[],lineas:[],tiposRepuesto:[]}) };
    let configChanged = false;
    
    if (product.marcaRepuesto && !newConfig.marcasRepuesto.includes(product.marcaRepuesto)) {
      newConfig.marcasRepuesto.push(product.marcaRepuesto);
      configChanged = true;
    }
    if (product.marcaVehiculo && !newConfig.marcasVehiculo.includes(product.marcaVehiculo)) {
      newConfig.marcasVehiculo.push(product.marcaVehiculo);
      configChanged = true;
    }
    if (product.linea && !newConfig.lineas.includes(product.linea)) {
      newConfig.lineas.push(product.linea);
      configChanged = true;
    }
    if (product.tipoRepuesto && !newConfig.tiposRepuesto.includes(product.tipoRepuesto)) {
      newConfig.tiposRepuesto.push(product.tipoRepuesto);
      configChanged = true;
    }
    if (configChanged) {
      setInventoryConfig(newConfig);
    }
`;

if (!code.includes('configChanged = true;')) {
  code = code.replace('setInventory(prev => isEditMode ? prev.map(p => p.id === product.id ? product : p) : [...prev, product]);', 'setInventory(prev => isEditMode ? prev.map(p => p.id === product.id ? product : p) : [...prev, product]);\n' + updateConfigLogic);
}

fs.writeFileSync('src/pages/Inventory.tsx', code);
console.log('Inventory patched with config');
