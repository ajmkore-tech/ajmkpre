const { Project, ts } = require('ts-morph');
const fs = require('fs');

const project = new Project({ tsConfigFilePath: "tsconfig.json" });
let sourceFile = project.getSourceFileOrThrow("src/pages/Sales.tsx");

function getErrors() {
    return project.getProgram().getSyntacticDiagnostics(sourceFile).length;
}

let currentErrors = getErrors();
let lines = sourceFile.getFullText().split('\n');

console.log("Initial syntactic errors:", currentErrors);

let i = 0;
while (i < lines.length) {
    if (currentErrors === 0) break;
    lines.splice(i, 0, "      }");
    sourceFile.replaceWithText(lines.join('\n'));
    
    const newErrors = getErrors();
    if (newErrors < currentErrors) {
        currentErrors = newErrors;
        console.log(`Inserted at line ${i}. Errors remaining: ${currentErrors}`);
        fs.writeFileSync("src/pages/Sales.tsx", lines.join('\n'));
        i++;
    } else {
        lines.splice(i, 1);
        sourceFile.replaceWithText(lines.join('\n'));
    }
    i++;
}

fs.writeFileSync("src/pages/Sales.tsx", lines.join('\n'));
console.log("Done. Final errors:", currentErrors);
