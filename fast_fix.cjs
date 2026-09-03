const { Project } = require('ts-morph');
const fs = require('fs');

const project = new Project({ tsConfigFilePath: "tsconfig.json" });
const sourceFile = project.getSourceFileOrThrow("src/pages/Sales.tsx");

function getErrors() {
    return sourceFile.getPreEmitDiagnostics().length;
}

let currentErrors = getErrors();
let lines = sourceFile.getFullText().split('\n');

console.log("Initial errors:", currentErrors);

let i = 0;
while (i < lines.length) {
    lines.splice(i, 0, "      }");
    sourceFile.replaceWithText(lines.join('\n'));
    
    const newErrors = getErrors();
    if (newErrors < currentErrors) {
        currentErrors = newErrors;
        i++;
    } else {
        lines.splice(i, 1);
        sourceFile.replaceWithText(lines.join('\n'));
    }
    i++;
}

fs.writeFileSync("src/pages/Sales.tsx", lines.join('\n'));
console.log("Done. Final errors:", currentErrors);
