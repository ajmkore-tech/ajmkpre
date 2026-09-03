const fs = require('fs');
let code = fs.readFileSync('src/pages/Configuracion.tsx', 'utf8');

code = code.replace(
  'verCostosUtilidad: false,',
  'verCostosUtilidad: false,\n          editarCostos: false,'
);

const newCheckbox = `<div className="flex items-center gap-2 cursor-pointer group">
                            <div onClick={() => togglePermission('inventario', 'editarCostos')}>
                              {editingRole.permissions.inventario.editarCostos ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />}
                            </div>
                            <span className="text-xs font-bold text-gray-600 select-none" onClick={() => togglePermission('inventario', 'editarCostos')}>Editar Costos (Manual)</span>
                          </div>`;

code = code.replace(
  /<div className="flex items-center gap-2 cursor-pointer group">\s*<div onClick=\{[^}]*verCostosUtilidad[^}]*\}>\s*\{editingRole\.permissions\.inventario\.verCostosUtilidad [^}]*\s*<\/div>\s*<span[^>]*>Ver Costos y Utilidad<\/span>\s*<\/div>/g,
  `$&
                          ${newCheckbox}`
);

fs.writeFileSync('src/pages/Configuracion.tsx', code);
