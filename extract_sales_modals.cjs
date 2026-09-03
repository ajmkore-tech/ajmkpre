const fs = require('fs');
const path = require('path');

const salesPath = 'src/pages/Sales.tsx';
let content = fs.readFileSync(salesPath, 'utf8');

// The file structure:
// ...
//       {/* New Order Modal */}
//       {isModalOpen && (
//          ...
//       )}
//
//       {/* Closing Sale Modal */}
//       {isClosingModalOpen && closingSale && (
//          ...
//       )}
//     </div>
//   );
// }

// Find the boundaries
const isModalOpenStart = content.indexOf('{isModalOpen && (');
const isClosingModalOpenStart = content.indexOf('{isClosingModalOpen && closingSale && (');

if (isModalOpenStart !== -1 && isClosingModalOpenStart !== -1) {
    // Extract everything from isModalOpenStart up to isClosingModalOpenStart
    // This is the entire NewSaleModal block (plus maybe some whitespace)
    
    // Actually it's better to manually copy and paste using ts-morph, 
    // but since we don't have it, we'll do bracket matching.
    function getBracketMatch(str, startIdx) {
        let count = 0;
        for (let i = startIdx; i < str.length; i++) {
            if (str[i] === '(') count++;
            if (str[i] === ')') {
                count--;
                if (count === 0) return i;
            }
        }
        return -1;
    }
    
    const isModalOpenParen = content.indexOf('(', isModalOpenStart);
    const modalOpenEnd = getBracketMatch(content, isModalOpenParen);
    
    const closingModalParen = content.indexOf('(', isClosingModalOpenStart);
    const closingModalEnd = getBracketMatch(content, closingModalParen);
    
    console.log("Modal 1 bounds:", isModalOpenStart, modalOpenEnd);
    console.log("Modal 2 bounds:", isClosingModalOpenStart, closingModalEnd);
} else {
    console.log("Could not find modal starts");
}
