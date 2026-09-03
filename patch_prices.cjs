const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventory.tsx', 'utf8');

code = code.replace(
  /: \(item\.precioMayor\?\.toFixed\(2\) \|\| '0\.00'\)/g,
  ": (item.precioMayor ? item.precioMayor.toFixed(2) : 'S/P')"
);
code = code.replace(
  /: \(item\.precioMinor\?\.toFixed\(2\) \|\| '0\.00'\)/g,
  ": (item.precioMinor ? item.precioMinor.toFixed(2) : 'S/P')"
);
code = code.replace(
  /: formatBs\(item\.precioMayor \|\| 0\)/g,
  ": (item.precioMayor ? formatBs(item.precioMayor) : 'S/P')"
);
code = code.replace(
  /: formatBs\(item\.precioMinor \|\| 0\)/g,
  ": (item.precioMinor ? formatBs(item.precioMinor) : 'S/P')"
);

code = code.replace(
  /: "\\$" \+ \(selectedProduct\.precioMayor\?\.toFixed\(2\) \|\| '0\.00'\)/g,
  ": (selectedProduct.precioMayor ? '$' + selectedProduct.precioMayor.toFixed(2) : 'S/P')"
);
code = code.replace(
  /: "\\$" \+ \(selectedProduct\.precioMinor\?\.toFixed\(2\) \|\| '0\.00'\)/g,
  ": (selectedProduct.precioMinor ? '$' + selectedProduct.precioMinor.toFixed(2) : 'S/P')"
);
code = code.replace(
  /: formatBs\(selectedProduct\.precioMayor \|\| 0\)/g,
  ": (selectedProduct.precioMayor ? formatBs(selectedProduct.precioMayor) : 'S/P')"
);
code = code.replace(
  /: formatBs\(selectedProduct\.precioMinor \|\| 0\)/g,
  ": (selectedProduct.precioMinor ? formatBs(selectedProduct.precioMinor) : 'S/P')"
);

fs.writeFileSync('src/pages/Inventory.tsx', code);
console.log('Prices patched.');
