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
    if (callee.type === 'Identifier') {
      const name = callee.name;
      // Filter out known safe built-ins and React hooks
      if (['useState', 'useEffect', 'useCallback', 'useMemo', 'useAppContext', 'useSearchParams', 'Number', 'String', 'Boolean', 'Array', 'Date', 'console', 'getDaysSince', 'getStatusColor', 'normalizeSearch', 'Math', 'alert'].includes(name)) return;
      if (name.startsWith('set')) return; // handled earlier
      
      let parent = path.parentPath;
      let isSafe = false;
      
      while (parent) {
        if (parent.type === 'JSXAttribute') {
          isSafe = true;
        }
        if (parent.type === 'CallExpression' && parent.node.callee.type === 'Identifier') {
          const pName = parent.node.callee.name;
          if (['useEffect', 'useCallback', 'useMemo', 'setTimeout', 'setInterval'].includes(pName)) {
            isSafe = true;
          }
        }
        if (parent.type === 'VariableDeclarator') {
           // if it's right side of a variable declaration, it IS called during render!
           // e.g. const x = myFunc();
        }
        if (parent.type === 'ArrowFunctionExpression' || parent.type === 'FunctionExpression') {
           // It's inside a callback/handler
           isSafe = true;
        }
        parent = parent.parentPath;
      }
      
      if (!isSafe) {
        console.log(`Render-phase call: ${name} at line ${path.node.loc.start.line}`);
      }
    }
  }
});
