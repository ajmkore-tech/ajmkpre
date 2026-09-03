const fs = require('fs');

const code = fs.readFileSync('src/pages/Inventory.tsx', 'utf8');

function extractBlock(startComment) {
    const startIndex = code.indexOf(startComment);
    if (startIndex === -1) return null;
    
    // Find the opening brace of the conditional block, e.g., {isImportModalOpen && (
    let i = code.indexOf('{', startIndex);
    if (i === -1) return null;
    let braceCount = 1;
    let endIndex = -1;
    for (let j = i + 1; j < code.length; j++) {
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

const m1 = extractBlock('{/* Import Modal */}');
const m2 = extractBlock('{/* Create Product Modal */}');
const m3 = extractBlock('{/* Adjust Inventory Modal */}');
const m4 = extractBlock('{/* Detalles Modal */}');
const m5 = extractBlock('{/* Movement History Modal */}');

console.log('m1:', m1 ? m1.content.substring(0, 50) + '...' + m1.content.length : 'not found');
console.log('m2:', m2 ? m2.content.substring(0, 50) + '...' + m2.content.length : 'not found');
console.log('m3:', m3 ? m3.content.substring(0, 50) + '...' + m3.content.length : 'not found');
console.log('m4:', m4 ? m4.content.substring(0, 50) + '...' + m4.content.length : 'not found');
console.log('m5:', m5 ? m5.content.substring(0, 50) + '...' + m5.content.length : 'not found');

fs.writeFileSync('import_modal.txt', m1 ? m1.content : '');
fs.writeFileSync('create_modal.txt', m2 ? m2.content : '');
fs.writeFileSync('adjust_modal.txt', m3 ? m3.content : '');
fs.writeFileSync('detail_modal.txt', m4 ? m4.content : '');
fs.writeFileSync('history_modal.txt', m5 ? m5.content : '');
