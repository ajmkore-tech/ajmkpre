const fs = require('fs');
let data = JSON.parse(fs.readFileSync('src/data/roles.json', 'utf8'));

if (data[0].permissions.inventario) {
    data[0].permissions.inventario.editarCostos = true;
}
if (data[1].permissions.inventario) {
    data[1].permissions.inventario.editarCostos = false;
}

fs.writeFileSync('src/data/roles.json', JSON.stringify(data, null, 2));
