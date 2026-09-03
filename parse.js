const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('profit.txt', 'utf8');
const lines = content.split('\n');

const products = [];
const dict = {};

// Pass 1: Build dictionary
lines.forEach(line => {
  const parts = line.split('|').map(p => p.replace(/"/g, '').trim());
  if (parts.length >= 2 && parts.length <= 4 && parts[0] && parts[1]) {
     dict[parts[0]] = parts[1];
  }
});

// Pass 2: Build products
lines.forEach(line => {
  const parts = line.split('|').map(p => p.replace(/"/g, '').trim());
  if (parts.length >= 20) {
     const codigo = parts[8] || parts[0];
     const detalle = parts[1];
     const categoria = dict[parts[2]] || parts[2] || '-';
     const marca = dict[parts[3]] || parts[3] || '-';
     const tipo = dict[parts[4]] || parts[4] || '-';
     const proveedor = dict[parts[5]] || parts[5] || '-';
     const stockDisp = parseFloat(parts[15]) || 0;
     const precioMayor = parseFloat(parts[16]) || 0;
     const precioMinor = parseFloat(parts[17]) || 0;

     products.push({
       id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
       codigo,
       detalle,
       categoria,
       marca,
       tipo,
       proveedor,
       stockDisp,
       stockComp: 0,
       stockTrans: 0,
       stockTotal: stockDisp,
       precioMayor,
       precioMinor
     });
  }
});

fs.mkdirSync(path.join(process.cwd(), 'src', 'data'), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), 'src', 'data', 'inventory.json'), JSON.stringify(products, null, 2));
console.log('Successfully wrote', products.length, 'products to inventory.json');
