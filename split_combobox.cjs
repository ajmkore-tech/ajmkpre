const fs = require('fs');

const path = 'src/pages/Inventory.tsx';
let content = fs.readFileSync(path, 'utf8');

const start = content.indexOf('function Combobox(');
const end = content.indexOf('export default function Inventory() {');

if (start > -1 && end > -1) {
    const code = content.substring(start, end);
    
    const componentContent = `import React, { useState, useRef, useEffect, useMemo } from 'react';\nimport { ChevronDown } from 'lucide-react';\n\nexport default ${code}`;
    fs.writeFileSync('src/components/Combobox.tsx', componentContent);
    
    // Remove from Inventory.tsx
    let newContent = content.substring(0, start) + content.substring(end);
    
    // Add import
    const lastImportIndex = newContent.lastIndexOf('import ');
    const endOfLastImport = newContent.indexOf(';', lastImportIndex) + 1;
    newContent = newContent.substring(0, endOfLastImport) + 
                      "\nimport Combobox from '../components/Combobox';" + 
                      newContent.substring(endOfLastImport);
                      
    fs.writeFileSync(path, newContent);
    console.log("Combobox split successfully!");
}
