const fs = require('fs');

const hookContent = fs.readFileSync('src/hooks/useSalesState.tsx', 'utf8');
const hookStart = hookContent.indexOf('export const useSalesState = () => {\n') + 'export const useSalesState = () => {\n'.length;
const hookEnd = hookContent.lastIndexOf('  return {');
const logic = hookContent.substring(hookStart, hookEnd);

let salesContent = fs.readFileSync('src/pages/Sales.tsx', 'utf8');
salesContent = salesContent.replace("import { useSalesState } from '../hooks/useSalesState';\n", '');

const salesStart = salesContent.indexOf('export default function Sales() {\n');
const salesEnd = salesContent.indexOf('  return (\n    <div className="h-full flex flex-col bg-[#F8FAFC]">');

// Remove the `const state = useSalesState(); const { ... } = state;`
salesContent = salesContent.substring(0, salesStart + 'export default function Sales() {\n'.length) + logic + salesContent.substring(salesEnd);

fs.writeFileSync('src/pages/Sales.tsx', salesContent);
fs.unlinkSync('src/hooks/useSalesState.tsx');
console.log("Reverted Sales.tsx");
