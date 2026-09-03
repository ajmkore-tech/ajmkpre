const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const oldInventoryInit = `const [inventory, setInventory] = useState<Product[]>(() => {
    const saved = localStorage.getItem('app_inventory_v2');
    return saved ? JSON.parse(saved) : (inventoryData as Product[]);
  });`;

const newInventoryInit = `const [inventory, setInventory] = useState<Product[]>(() => {
    const saved = localStorage.getItem('app_inventory_v2');
    const parsed = saved ? JSON.parse(saved) : [];
    if (parsed.length === 0) {
      return inventoryData as Product[];
    }
    return parsed;
  });`;

code = code.replace(oldInventoryInit, newInventoryInit);
fs.writeFileSync('src/context/AppContext.tsx', code);
