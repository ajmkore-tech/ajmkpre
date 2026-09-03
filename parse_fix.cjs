const { Project } = require('ts-morph');
const fs = require('fs');

const project = new Project();
let sourceFile = project.createSourceFile("temp.tsx", fs.readFileSync("src/pages/Sales.tsx", "utf8"), { overwrite: true });

function getErrors() {
    return sourceFile.getParseDiagnostics().length;
}

let currentErrors = getErrors();
let lines = sourceFile.getFullText().split('\n');

console.log("Initial parse errors:", currentErrors);

let i = 0;
while (i < lines.length) {
    if (currentErrors === 0) break;
    lines.splice(i, 0, "      }");
    sourceFile.replaceWithText(lines.join('\n'));
    
    const newErrors = getErrors();
    if (newErrors < currentErrors) {
        console.log(`Inserted at line ${i}. Parse errors: ${newErrors}`);
        currentErrors = newErrors;
        i++;
    } else {
        lines.splice(i, 1);
        sourceFile.replaceWithText(lines.join('\n'));
    }
    i++;
}

fs.writeFileSync("src/pages/Sales.tsx", lines.join('\n'));
console.log("Done. Final parse errors:", currentErrors);
