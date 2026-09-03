const fs = require('fs');

// Patch types/index.ts
let typesCode = fs.readFileSync('src/types/index.ts', 'utf8');
typesCode = typesCode.replace(/verPrecioMinorista: boolean;\s*/, '');
typesCode = typesCode.replace(/ventaLocal: boolean;\s*/, '');
typesCode = typesCode.replace(/ventaExterna: boolean;\s*/, '');
// Ensure editarPrecio is there
if (!typesCode.includes('editarPrecio: boolean')) {
    typesCode = typesCode.replace(
        /verPrecioMayorista: boolean;/,
        'verPrecioMayorista: boolean;\n      editarPrecio: boolean;'
    );
}
fs.writeFileSync('src/types/index.ts', typesCode);

// Patch data/roles.json
let rolesJson = JSON.parse(fs.readFileSync('src/data/roles.json', 'utf8'));
rolesJson = rolesJson.map(r => {
    delete r.permissions.ventas.verPrecioMinorista;
    delete r.permissions.ventas.ventaLocal;
    delete r.permissions.ventas.ventaExterna;
    if (r.permissions.ventas.editarPrecio === undefined) {
        r.permissions.ventas.editarPrecio = true; // default true for admin, etc.
    }
    return r;
});
fs.writeFileSync('src/data/roles.json', JSON.stringify(rolesJson, null, 2));

console.log("Patched types and roles.json");
