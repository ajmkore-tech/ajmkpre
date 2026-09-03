const fs = require('fs');
const code = fs.readFileSync('src/pages/Sales.tsx', 'utf8');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx', 'typescript']
});

traverse(ast, {
  CallExpression(path) {
    const callee = path.node.callee;
    if (callee.type === 'Identifier' && callee.name.startsWith('set') && callee.name !== 'setTimeout' && callee.name !== 'setInterval' && callee.name !== 'setHours') {
      
      let parent = path.parentPath;
      let isSafe = false;
      
      while (parent) {
        if (parent.type === 'JSXAttribute') {
          if (parent.node.name.name && parent.node.name.name.startsWith('on')) {
            isSafe = true;
          }
        }
        if (parent.type === 'CallExpression' && parent.node.callee.type === 'Identifier') {
          const name = parent.node.callee.name;
          if (['useEffect', 'useCallback', 'useMemo', 'setTimeout', 'setInterval'].includes(name)) {
            isSafe = true;
          }
        }
        // check if it's inside a function definition that is passed to something safe
        // e.g. const handleDelete = () => setSales(...)
        // then handleDelete is passed to onClick.
        if (parent.type === 'VariableDeclarator') {
           // We'll consider it safe if it's a defined function, as we assume it's an event handler.
           isSafe = true;
        }
        parent = parent.parentPath;
      }
      
      if (!isSafe) {
        console.log(`Potential render-phase call: ${callee.name} at line ${path.node.loc.start.line}`);
      }
    }
  }
});
