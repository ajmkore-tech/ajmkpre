const fs = require('fs');

let comboboxContent = fs.readFileSync('src/components/Combobox.tsx', 'utf8');
const movementIndex = comboboxContent.indexOf('interface Movement {');
const movementCode = comboboxContent.substring(movementIndex);
comboboxContent = comboboxContent.substring(0, movementIndex);
fs.writeFileSync('src/components/Combobox.tsx', comboboxContent);

let typesContent = fs.readFileSync('src/types/index.ts', 'utf8');
typesContent += '\nexport ' + movementCode;
fs.writeFileSync('src/types/index.ts', typesContent);

let inventoryContent = fs.readFileSync('src/pages/Inventory.tsx', 'utf8');
inventoryContent = inventoryContent.replace(
    'import { Product } from \'../types\';',
    'import { Product, Movement } from \'../types\';'
);
fs.writeFileSync('src/pages/Inventory.tsx', inventoryContent);

console.log("Movement fixed!");
