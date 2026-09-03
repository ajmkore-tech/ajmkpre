const fs = require('fs');

const code = fs.readFileSync('src/pages/Inventory.tsx', 'utf8');

function extractBlockByCondition(condition) {
    const startIndex = code.indexOf(condition);
    if (startIndex === -1) return null;
    
    let braceCount = 1;
    let endIndex = -1;
    for (let j = startIndex + condition.length; j < code.length; j++) {
        if (code[j] === '{') braceCount++;
        if (code[j] === '}') braceCount--;
        if (braceCount === 0) {
            endIndex = j;
            break;
        }
    }
    return {
        start: startIndex,
        end: endIndex + 1,
        content: code.substring(startIndex, endIndex + 1)
    };
}

const history = extractBlockByCondition('{viewHistoryProduct && (');
const importModal = extractBlockByCondition('{isImportModalOpen && (');
const createModal = extractBlockByCondition('{isCreateModalOpen && (');
const adjustModal = extractBlockByCondition('{isAdjustModalOpen && (');
const detailModal = extractBlockByCondition('{isDetailModalOpen && selectedProduct && (');
const committedModal = extractBlockByCondition('{showCommittedDetails && (');

fs.writeFileSync('HistoryModal.tsx', history ? history.content : '');
fs.writeFileSync('ImportModal.tsx', importModal ? importModal.content : '');
fs.writeFileSync('CreateProductModal.tsx', createModal ? createModal.content : '');
fs.writeFileSync('AdjustStockModal.tsx', adjustModal ? adjustModal.content : '');
fs.writeFileSync('ProductDetailModal.tsx', detailModal ? detailModal.content : '');
fs.writeFileSync('CommittedModal.tsx', committedModal ? committedModal.content : '');

console.log('Done!');
