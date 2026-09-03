const fs = require('fs');
const code = fs.readFileSync('src/pages/../context/AppContext.tsx', 'utf8');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx', 'typescript']
});

traverse(ast, {
  CallExpression(path) {
    if (path.node.callee.type === 'Identifier' && path.node.callee.name.startsWith('set')) {
      let parent = path.parentPath;
      let isRenderPhase = false;
      let functionName = '';
      
      while (parent) {
        if (parent.type === 'ArrowFunctionExpression' || parent.type === 'FunctionExpression') {
          // It's inside a function. But what if it's the component itself? (e.g. const Comp = () => {})
          if (parent.parent.type === 'VariableDeclarator') {
            functionName = parent.parent.id.name;
            isRenderPhase = true;
          }
          break;
        }
        if (parent.type === 'FunctionDeclaration') {
          if (parent.node.id) {
             functionName = parent.node.id.name;
             isRenderPhase = true;
          }
          break;
        }
        parent = parent.parentPath;
      }
      
      if (isRenderPhase && /^[A-Z]/.test(functionName)) {
        console.log(`Found direct call: ${path.node.callee.name} at line ${path.node.loc.start.line} in component ${functionName}`);
      }
    }
  }
});
