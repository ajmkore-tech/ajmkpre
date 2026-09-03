const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const importsToAdd = `import mockSales from '../data/mockSales.json';
import clientsData from '../data/clients.json';
import inventoryData from '../data/inventory.json';
`;

content = content.replace('export const defaultInventoryConfig: InventoryConfig = {', importsToAdd + '\nexport const defaultInventoryConfig: InventoryConfig = {');

fs.writeFileSync('src/context/AppContext.tsx', content);
