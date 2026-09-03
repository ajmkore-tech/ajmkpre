const { Project, ts } = require('ts-morph');
const project = new Project({ tsConfigFilePath: "tsconfig.json" });
let sourceFile = project.getSourceFileOrThrow("src/pages/Sales.tsx");
console.log(project.getProgram().getSyntacticDiagnostics(sourceFile).map(d => d.getMessageText() + ' at ' + d.getStart()).join('\n'));
