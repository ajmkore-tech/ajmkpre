const fs = require('fs');
const { Project } = require('ts-morph');

const project = new Project({ tsConfigFilePath: "tsconfig.json" });
let sourceFile = project.getSourceFileOrThrow("src/pages/Sales.tsx");

function getErrorCount() {
    return sourceFile.getPreEmitDiagnostics().length;
}

let currentErrors = getErrorCount();
let lines = fs.readFileSync("src/pages/Sales.tsx", "utf8").split("\n");

console.log("Initial errors:", currentErrors);

let i = 0;
while (i < lines.length) {
    const originalLine = lines[i];
    
    // Try inserting `      }` before the current line
    lines.splice(i, 0, "      }");
    fs.writeFileSync("src/pages/Sales.tsx", lines.join("\n"));
    sourceFile.refreshFromFileSystemSync();
    
    const newErrors = getErrorCount();
    if (newErrors < currentErrors) {
        console.log(`Fixed error by inserting at line ${i}. Errors went from ${currentErrors} to ${newErrors}`);
        currentErrors = newErrors;
        i++; // move past the inserted line
    } else {
        // revert
        lines.splice(i, 1);
        fs.writeFileSync("src/pages/Sales.tsx", lines.join("\n"));
        sourceFile.refreshFromFileSystemSync();
    }
    i++;
}

console.log("Final errors:", currentErrors);
