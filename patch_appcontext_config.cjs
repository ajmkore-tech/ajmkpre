const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const interfacesToAdd = `
export interface InventoryConfig {
  marcasRepuesto: string[];
  marcasVehiculo: string[];
  lineas: string[];
  tiposRepuesto: string[];
}
`;

if (!code.includes('export interface InventoryConfig')) {
  code = code.replace('export interface Product', interfacesToAdd + '\nexport interface Product');
}

const contextTypeProps = `
  inventoryConfig: InventoryConfig;
  setInventoryConfig: React.Dispatch<React.SetStateAction<InventoryConfig>>;
`;

if (!code.includes('inventoryConfig: InventoryConfig;')) {
  code = code.replace('  inventory: Product[];', contextTypeProps + '\n  inventory: Product[];');
}

const defaultInvConfig = `
const defaultInventoryConfig: InventoryConfig = {
  marcasRepuesto: [],
  marcasVehiculo: [],
  lineas: [],
  tiposRepuesto: []
};
`;

if (!code.includes('defaultInventoryConfig')) {
  code = code.replace('export const AppProvider', defaultInvConfig + '\nexport const AppProvider');
}

const stateDef = `
  const [inventoryConfig, setInventoryConfig] = useState<InventoryConfig>(() => {
    const saved = localStorage.getItem('inventoryConfig');
    return saved ? JSON.parse(saved) : defaultInventoryConfig;
  });

  useEffect(() => {
    localStorage.setItem('inventoryConfig', JSON.stringify(inventoryConfig));
  }, [inventoryConfig]);
`;

if (!code.includes('inventoryConfig, setInventoryConfig')) {
  code = code.replace('  const [inventory, setInventory] = useState<Product[]>(', stateDef + '\n  const [inventory, setInventory] = useState<Product[]>(');
}

const providerVal = `inventoryConfig, setInventoryConfig,`;

if (!code.includes('inventoryConfig, setInventoryConfig,')) {
  code = code.replace('value={{', 'value={{\n      ' + providerVal);
}

fs.writeFileSync('src/context/AppContext.tsx', code);
console.log('Appcontext patched.');
