const fs = require('fs');

let lines = fs.readFileSync('src/pages/Sales.tsx', 'utf8').split('\n');
let newLines = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevLine = i > 0 ? lines[i - 1] : "";
    
    // Check indentation of current line
    const currentIndent = line.match(/^\s*/)[0].length;
    const prevIndent = prevLine.match(/^\s*/)[0].length;
    
    if (line.trim() === '}' && currentIndent === 4 && prevIndent >= 8) {
        newLines.push('      }');
    }
    else if (line.trim() === '}' && currentIndent === 2 && prevIndent >= 6) {
        // e.g., missing 4 spaces bracket
        // newLines.push('    }'); 
    }
    
    newLines.push(line);
}

fs.writeFileSync('src/pages/Sales.tsx', newLines.join('\n'));
console.log("Applied heuristic!");
