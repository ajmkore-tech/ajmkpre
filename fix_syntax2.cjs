const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventory.tsx', 'utf8');

const brokenSyntax = `    const product: Product = {
      ...(newProduct as Product),
      marcaRepuesto: newProduct.marcaRepuesto?.trim().toUpperCase(),
      marcaVehiculo: newProduct.marcaVehiculo?.trim().toUpperCase(),
      linea: newProduct.linea?.trim().toUpperCase(),
      tipoRepuesto: newProduct.tipoRepuesto?.trim().toUpperCase(),
    };
      id: Math.random().toString(36).substr(2, 9),`;

const fixedSyntax = `    const product: Product = {
      ...(newProduct as Product),
      marcaRepuesto: newProduct.marcaRepuesto?.trim().toUpperCase(),
      marcaVehiculo: newProduct.marcaVehiculo?.trim().toUpperCase(),
      linea: newProduct.linea?.trim().toUpperCase(),
      tipoRepuesto: newProduct.tipoRepuesto?.trim().toUpperCase(),
      id: Math.random().toString(36).substr(2, 9),`;

code = code.replace(brokenSyntax, fixedSyntax);
fs.writeFileSync('src/pages/Inventory.tsx', code);
console.log('Fixed syntax in Inventory.tsx');
