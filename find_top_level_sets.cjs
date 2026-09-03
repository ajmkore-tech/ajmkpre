const fs = require('fs');
const code = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

// Parse with Babel
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx', 'typescript']
});

traverse(ast, {
  CallExpression(path) {
    if (path.node.callee.type === 'Identifier' && path.node.callee.name.startsWith('set')) {
      // Check if it's directly inside the component body
      let parent = path.parentPath;
      let isRenderPhase = false;
      
      while (parent) {
        if (parent.type === 'ArrowFunctionExpression' || parent.type === 'FunctionExpression') {
          // It's inside a function. But what if it's the component itself?
          break;
        }
        if (parent.type === 'FunctionDeclaration') {
          if (parent.node.id && parent.node.id.name === 'Sales') {
             isRenderPhase = true;
          }
          break;
        }
        parent = parent.parentPath;
      }
      
      if (isRenderPhase) {
        console.log(`Found direct call: ${path.node.callee.name} at line ${path.node.loc.start.line}`);
      }
    }
  }
});
