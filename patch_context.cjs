const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const oldInit = `const [inventory, setInventory] = useState<Product[]>(() => {
    const saved = localStorage.getItem('app_inventory_v2');
    const parsed = saved ? JSON.parse(saved) : [];
    if (parsed.length === 0) {
      return inventoryData as Product[];
    }
    return parsed;
  });`;

const newInit = `const [inventory, setInventory] = useState<Product[]>(() => {
    const saved = localStorage.getItem('app_inventory_v2');
    const parsed = saved ? JSON.parse(saved) : [];
    let initial = parsed.length === 0 ? (inventoryData as Product[]) : parsed;
    
    // Migrate to include ultimoCosto and costoPromedio and history array
    return initial.map(p => ({
      ...p,
      ultimoCosto: typeof p.ultimoCosto === 'number' ? p.ultimoCosto : (p.costoDolar || 0),
      costoPromedio: typeof p.costoPromedio === 'number' ? p.costoPromedio : (p.costoDolar || 0),
      historialCostos: p.historialCostos || []
    }));
  });`;

code = code.replace(oldInit, newInit);
fs.writeFileSync('src/context/AppContext.tsx', code);
