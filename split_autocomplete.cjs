const fs = require('fs');

const salesPath = 'src/pages/Sales.tsx';
let salesContent = fs.readFileSync(salesPath, 'utf8');

const autocompleteStart = salesContent.indexOf('function Autocomplete(');
const autocompleteEnd = salesContent.indexOf('const canPrintDocument') - 1;

if (autocompleteStart > -1 && autocompleteEnd > -1) {
    const autocompleteCode = salesContent.substring(autocompleteStart, autocompleteEnd);
    
    // Create Autocomplete.tsx
    const autoContent = `import React, { useState, useRef, useEffect, useMemo } from 'react';\n\nexport default ${autocompleteCode}`;
    fs.writeFileSync('src/components/Autocomplete.tsx', autoContent);
    
    // Remove from Sales.tsx and add import
    let newSalesContent = salesContent.substring(0, autocompleteStart) + salesContent.substring(autocompleteEnd);
                            
    // Find the last import and add our new import after it
    const lastImportIndex = newSalesContent.lastIndexOf('import ');
    const endOfLastImport = newSalesContent.indexOf(';', lastImportIndex) + 1;
    
    newSalesContent = newSalesContent.substring(0, endOfLastImport) + 
                      "\nimport Autocomplete from '../components/Autocomplete';" + 
                      newSalesContent.substring(endOfLastImport);
    
    fs.writeFileSync(salesPath, newSalesContent);
    console.log("Autocomplete split successfully!");
}
