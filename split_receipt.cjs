const fs = require('fs');

const path = 'src/pages/CxC.tsx';
let content = fs.readFileSync(path, 'utf8');

const genStart = content.indexOf('  const generateReceiptPDF = ');
const genEnd = content.indexOf('  const handleAbonoSubmit = ');

if (genStart > -1 && genEnd > -1) {
    let genCode = content.substring(genStart, genEnd);
    
    // Replace the signature to pass receipt logic
    
    const hookContent = `import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale, Client, Receipt } from '../types';
import { useAppContext } from '../context/AppContext';

export const useReceiptGenerator = () => {
  const { formatBs, companyConfig, sequencesConfig, setSequencesConfig } = useAppContext();

${genCode}
  return { generateReceiptPDF, handlePrintReceipt };
};
`;
    fs.writeFileSync('src/hooks/useReceiptGenerator.ts', hookContent);
    
    // Remove from CxC.tsx
    let newContent = content.substring(0, genStart) + content.substring(genEnd);
    
    // Add import
    const lastImportIndex = newContent.lastIndexOf('import ');
    const endOfLastImport = newContent.indexOf(';', lastImportIndex) + 1;
    newContent = newContent.substring(0, endOfLastImport) + 
                      "\nimport { useReceiptGenerator } from '../hooks/useReceiptGenerator';" + 
                      newContent.substring(endOfLastImport);
                      
    // Add hook call inside component
    const funcIndex = newContent.indexOf('export default function CxC() {');
    const insideIndex = newContent.indexOf('{', funcIndex) + 1;
    newContent = newContent.substring(0, insideIndex) + 
                      "\n  const { generateReceiptPDF, handlePrintReceipt } = useReceiptGenerator();" + 
                      newContent.substring(insideIndex);
                      
    fs.writeFileSync(path, newContent);
    console.log("Receipt generator split successfully!");
}
