const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventory.tsx', 'utf8');

const uppercaseLogic = `
    const product: Product = {
      ...(newProduct as Product),
      marcaRepuesto: newProduct.marcaRepuesto?.trim().toUpperCase(),
      marcaVehiculo: newProduct.marcaVehiculo?.trim().toUpperCase(),
      linea: newProduct.linea?.trim().toUpperCase(),
      tipoRepuesto: newProduct.tipoRepuesto?.trim().toUpperCase(),
    };
`;

if (!code.includes('newProduct.marcaRepuesto?.trim().toUpperCase()')) {
  code = code.replace(`    const product: Product = {
      ...(newProduct as Product),`, uppercaseLogic);
  fs.writeFileSync('src/pages/Inventory.tsx', code);
  console.log('Uppercase patched');
}
