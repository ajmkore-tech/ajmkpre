const fs = require('fs');

const path = 'src/pages/Sales.tsx';
let content = fs.readFileSync(path, 'utf8');

const hookStart = content.indexOf('export default function Sales() {') + 'export default function Sales() {'.length;
const hookEnd = content.indexOf('  return (\n    <div className="h-full');

let logic = content.substring(hookStart, hookEnd);

// Find all top-level declarations in this logic block
const declarations = [];
const lines = logic.split('\n');
for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('const [')) {
        const match = trimmed.match(/const \[([a-zA-Z0-9_]+), ([a-zA-Z0-9_]+)\]/);
        if (match) {
            declarations.push(match[1]);
            declarations.push(match[2]);
        }
    } else if (trimmed.startsWith('const {')) {
        const match = trimmed.match(/const \{([^}]+)\}/);
        if (match) {
            const vars = match[1].split(',').map(v => v.trim().split(':')[0].split('=')[0].trim()).filter(v => v);
            declarations.push(...vars);
        }
    } else if (trimmed.startsWith('const ')) {
        const match = trimmed.match(/const ([a-zA-Z0-9_]+)\s*=/);
        if (match) {
            declarations.push(match[1]);
        }
    } else if (trimmed.startsWith('let ')) {
        const match = trimmed.match(/let ([a-zA-Z0-9_]+)\s*=/);
        if (match) {
            declarations.push(match[1]);
        }
    } else if (trimmed.startsWith('function ')) {
        const match = trimmed.match(/function ([a-zA-Z0-9_]+)\s*\(/);
        if (match) {
            declarations.push(match[1]);
        }
    }
}

// Ensure unique
const uniqueDecls = [...new Set(declarations)];
// Exclude known React hooks if any, but they are imported.
const exportsCode = `  return {\n    ${uniqueDecls.join(',\n    ')}\n  };\n`;

const hookFileContent = `import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useDocumentGenerator } from '../hooks/useDocumentGenerator';
import { SaleStatus, Sale, Client, Product } from '../types';

export const useSalesState = () => {
${logic}
${exportsCode}
};
`;

fs.writeFileSync('src/hooks/useSalesState.ts', hookFileContent);

// Now update Sales.tsx
const imports = content.substring(0, hookStart - 'export default function Sales() {'.length);
const jsx = content.substring(hookEnd);

const newSales = `${imports}
import { useSalesState } from '../hooks/useSalesState';

export default function Sales() {
  const state = useSalesState();
  const { ${uniqueDecls.join(', ')} } = state;

${jsx}`;

fs.writeFileSync(path, newSales);
console.log("Hook extracted successfully. Declarations count:", uniqueDecls.length);
