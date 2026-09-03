const fs = require('fs');
const { Project, SyntaxKind } = require('ts-morph');

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
});

const sourceFile = project.getSourceFileOrThrow("src/pages/Sales.tsx");

// Wait, I can just use string manipulation, it's faster for this specific case.
