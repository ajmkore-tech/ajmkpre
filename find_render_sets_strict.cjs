const fs = require('fs');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const files = glob.sync('src/**/*.tsx');

files.forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
  } catch(e) {
    return;
  }

  traverse(ast, {
    CallExpression(path) {
      const callee = path.node.callee;
      if (callee.type === 'Identifier' && callee.name.startsWith('set') && callee.name !== 'setTimeout' && callee.name !== 'setInterval' && callee.name !== 'setHours') {
        
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
             // If we reach a function, it's generally safe UNLESS it's an IIFE. Let's assume it's safe for now.
             // Wait, what if it's the component function itself?
             // If parent is the component function, it's NOT safe.
             // The component function is usually a FunctionDeclaration or an ArrowFunctionExpression assigned to a component name.
             // But if it's an event handler `const handleClick = () => { setSales() }`, it's safe.
             
             // Just flag anything that doesn't have an enclosing function other than the top-level component!
          }
          parent = parent.parentPath;
        }
        
      }
    }
  });
});
