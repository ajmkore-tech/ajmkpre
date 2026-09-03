const fs = require('fs');

const salesPath = 'src/pages/Sales.tsx';
let salesContent = fs.readFileSync(salesPath, 'utf8');

const genStart = salesContent.indexOf('  const generateDocument = (sale: Sale) => {');
const genEnd = salesContent.indexOf('  const handleSaveOrder = () => {');

if (genStart > -1 && genEnd > -1) {
    let genCode = salesContent.substring(genStart, genEnd);
    
    // Replace the signature to accept selectedSale and setSelectedSale
    genCode = genCode.replace(
        'const generateDocument = (sale: Sale) => {', 
        'const generateDocument = (sale: Sale, selectedSale: Sale | null, setSelectedSale: (s: Sale) => void) => {'
    );
    
    const hookContent = `import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale } from '../types';
import { useAppContext } from '../context/AppContext';

export const useDocumentGenerator = () => {
  const { formatBs, companyConfig, sequencesConfig, setSequencesConfig, setSales, sales } = useAppContext();

${genCode}
  return { generateDocument };
};
`;
    fs.writeFileSync('src/hooks/useDocumentGenerator.ts', hookContent);
    
    // Remove from Sales.tsx
    let newSalesContent = salesContent.substring(0, genStart) + salesContent.substring(genEnd);
    
    // Add import
    const lastImportIndex = newSalesContent.lastIndexOf('import ');
    const endOfLastImport = newSalesContent.indexOf(';', lastImportIndex) + 1;
    newSalesContent = newSalesContent.substring(0, endOfLastImport) + 
                      "\nimport { useDocumentGenerator } from '../hooks/useDocumentGenerator';" + 
                      newSalesContent.substring(endOfLastImport);
                      
    // Add hook call inside Sales component
    const salesFuncIndex = newSalesContent.indexOf('export default function Sales() {');
    const insideSalesIndex = newSalesContent.indexOf('{', salesFuncIndex) + 1;
    newSalesContent = newSalesContent.substring(0, insideSalesIndex) + 
                      "\n  const { generateDocument } = useDocumentGenerator();" + 
                      newSalesContent.substring(insideSalesIndex);
                      
    // Fix calls to generateDocument
    newSalesContent = newSalesContent.replace(/generateDocument\(selectedSale\)/g, "generateDocument(selectedSale, selectedSale, setSelectedSale)");
                      
    fs.writeFileSync(salesPath, newSalesContent);
    console.log("generateDocument split successfully!");
}
