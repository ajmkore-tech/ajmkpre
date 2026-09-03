const fs = require('fs');
const glob = require('glob');

const typesToExtract = [
  'ExchangeRates', 'Role', 'SaleStatus', 'SaleItem', 'Sale', 'Client', 'Provider',
  'InventoryConfig', 'Product', 'Receipt', 'PaymentMethod', 'PurchaseStatus',
  'PaymentRecord', 'PurchaseItem', 'Purchase', 'Expense', 'CompanyConfig',
  'SequencesConfig'
];

const files = fs.readdirSync('src/pages').map(f => 'src/pages/' + f);
files.push('src/components/SimplePage.tsx');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let hasChanges = false;
    
    // Check if the file imports from '../context/AppContext' or './context/AppContext'
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"](?:\.\.\/|\.\/)context\/AppContext['"];/g;
    
    content = content.replace(importRegex, (match, importsStr) => {
        const imports = importsStr.split(',').map(i => i.trim()).filter(i => i);
        const appContextImports = [];
        const typeImports = [];
        
        imports.forEach(i => {
            if (typesToExtract.includes(i)) {
                typeImports.push(i);
            } else {
                appContextImports.push(i);
            }
        });
        
        hasChanges = true;
        let newImports = '';
        if (appContextImports.length > 0) {
            newImports += `import { ${appContextImports.join(', ')} } from '../context/AppContext';\n`;
        }
        if (typeImports.length > 0) {
            // Need to handle relative path for types correctly based on the file depth
            let typePath = '../types';
            if (file.includes('components/')) typePath = '../types';
            newImports += `import { ${typeImports.join(', ')} } from '${typePath}';\n`;
        }
        return newImports.trim(); // Trim to avoid extra newlines causing issues
    });
    
    if (hasChanges) {
        fs.writeFileSync(file, content);
        console.log(`Updated imports in ${file}`);
    }
});
