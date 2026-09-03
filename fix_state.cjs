const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventory.tsx', 'utf8');

code = code.replace(
  "const [packedViewMode, setPackedViewMode] = useState<Record<string, boolean>>({});",
  "const [packedViewMode, setPackedViewMode] = useState<Record<string, boolean>>({});\n  const [viewHistoryProduct, setViewHistoryProduct] = useState<any>(null);"
);

fs.writeFileSync('src/pages/Inventory.tsx', code);
