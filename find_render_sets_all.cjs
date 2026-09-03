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
          if (parent.type === 'VariableDeclarator') {
             isSafe = true;
          }
          parent = parent.parentPath;
        }
        
        if (!isSafe) {
          console.log(`Potential render-phase call: ${callee.name} at line ${path.node.loc.start.line} in ${file}`);
        }
      }
    }
  });
});
