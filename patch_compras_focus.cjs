const fs = require('fs');
let code = fs.readFileSync('src/pages/Compras.tsx', 'utf8');

code = code.replace(
  /onChange=\{e => \{\s*handlePurchaseItemChange\(index, 'codigo', e\.target\.value\);\s*setProductSearch\(e\.target\.value\);\s*\}\}/g,
  "onChange={e => {\n                                  handlePurchaseItemChange(index, 'codigo', e.target.value);\n                                  setProductSearch(e.target.value);\n                                }}\n                                onFocus={() => setProductSearch(item.codigo)}\n                                onBlur={() => setTimeout(() => setProductSearch(''), 200)}"
);

code = code.replace(
  /onChange=\{e => \{\s*handlePurchaseItemChange\(index, 'detalle', e\.target\.value\);\s*setProductSearch\(e\.target\.value\);\s*\}\}/g,
  "onChange={e => {\n                                  handlePurchaseItemChange(index, 'detalle', e.target.value);\n                                  setProductSearch(e.target.value);\n                                }}\n                                onFocus={() => setProductSearch(item.detalle)}\n                                onBlur={() => setTimeout(() => setProductSearch(''), 200)}"
);

fs.writeFileSync('src/pages/Compras.tsx', code);
