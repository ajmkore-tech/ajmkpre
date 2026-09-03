const fs = require('fs');

let hookContent = fs.readFileSync('src/hooks/useReceiptGenerator.tsx', 'utf8');
const start = hookContent.indexOf('  const generateReceiptPDF = ');
const end = hookContent.lastIndexOf('  return {');
const codeToInject = hookContent.substring(start, end);

let cxcContent = fs.readFileSync('src/pages/CxC.tsx', 'utf8');
const hookImport = "import { useReceiptGenerator } from '../hooks/useReceiptGenerator';\n";
cxcContent = cxcContent.replace(hookImport, '');

const hookCall = "  const { generateReceiptPDF, handlePrintReceipt } = useReceiptGenerator();\n";
cxcContent = cxcContent.replace(hookCall, '');

const insertPos = cxcContent.indexOf('  const handleAbonoSubmit = ');
cxcContent = cxcContent.substring(0, insertPos) + codeToInject + cxcContent.substring(insertPos);

fs.writeFileSync('src/pages/CxC.tsx', cxcContent);
fs.unlinkSync('src/hooks/useReceiptGenerator.tsx');
console.log("Reverted CxC.tsx!");
