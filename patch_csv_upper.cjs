const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventory.tsx', 'utf8');

const oldMap = `            marcaRepuesto: String(row['Marca Repuesto'] || row['CO_CAT'] || '').trim(),
            marcaVehiculo: String(row['Marca Vehiculo'] || row['CO_COLOR'] || '').trim(),
            linea: String(row['Linea'] || row['CO_LIN'] || '').trim(),
            tipoRepuesto: String(row['Tipo de Repuesto'] || row['CO_SUBL'] || '').trim(),`;

const newMap = `            marcaRepuesto: String(row['Marca Repuesto'] || row['CO_CAT'] || '').trim().toUpperCase(),
            marcaVehiculo: String(row['Marca Vehiculo'] || row['CO_COLOR'] || '').trim().toUpperCase(),
            linea: String(row['Linea'] || row['CO_LIN'] || '').trim().toUpperCase(),
            tipoRepuesto: String(row['Tipo de Repuesto'] || row['CO_SUBL'] || '').trim().toUpperCase(),`;

if (code.includes(oldMap)) {
  code = code.replace(oldMap, newMap);
  fs.writeFileSync('src/pages/Inventory.tsx', code);
  console.log('CSV Import uppercased');
}
