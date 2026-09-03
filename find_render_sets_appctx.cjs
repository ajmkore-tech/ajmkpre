const fs = require('fs');
const code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx', 'typescript']
});

traverse(ast, {
  CallExpression(path) {
    const callee = path.node.callee;
    if (callee.type === 'Identifier' && callee.name.startsWith('set') && callee.name !== 'setTimeout' && callee.name !== 'setInterval' && callee.name !== 'setItem' && callee.name !== 'setHours') {
      
      let parent = path.parentPath;
      let isSafe = false;
      
      while (parent) {
        if (parent.type === 'JSXAttribute' && parent.node.name.name && parent.node.name.name.startsWith('on')) {
          isSafe = true;
        }
        if (parent.type === 'CallExpression' && parent.node.callee.type === 'Identifier') {
          const name = parent.node.callee.name;
          if (['useEffect', 'useCallback', 'useMemo', 'setTimeout', 'setInterval'].includes(name)) {
            isSafe = true;
          }
        }
        if (parent.type === 'ArrowFunctionExpression' || parent.type === 'FunctionExpression') {
           // We'll consider it safe if it's assigned to a variable or passed as an argument.
           // Let's assume all functions in AppContext are safe.
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
