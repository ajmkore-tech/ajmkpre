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
      if (callee.type === 'Identifier' && callee.name.startsWith('set') && callee.name !== 'setTimeout' && callee.name !== 'setInterval' && callee.name !== 'setItem' && callee.name !== 'setHours') {
        
        let parent = path.parentPath;
        let isSafe = false;
        
        while (parent) {
          if (parent.type === 'JSXAttribute') {
            isSafe = true;
          }
          if (parent.type === 'CallExpression' && parent.node.callee.type === 'Identifier') {
            const name = parent.node.callee.name;
            if (['useEffect', 'useCallback', 'useMemo', 'setTimeout', 'setInterval', 'map', 'filter', 'reduce'].includes(name)) {
              isSafe = true;
            }
          }
          // The issue might be in an ArrowFunctionExpression but NOT inside any known safe wrapper.
          // Wait, if it's inside an ArrowFunctionExpression, and that ArrowFunctionExpression is passed to `useState`, it's safe.
          parent = parent.parentPath;
        }
        
        // This will find ANY set call not in JSX or useEffect/useCallback
        if (!isSafe) {
          console.log(`Unsafe call: ${callee.name} at line ${path.node.loc.start.line} in ${file}`);
        }
      }
    }
  });
});
