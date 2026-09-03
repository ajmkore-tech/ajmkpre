const fs = require('fs');
let code = fs.readFileSync('src/pages/Configuracion.tsx', 'utf8');

const targetLabel = `<label className="flex items-center gap-3 cursor-pointer group">
                            <div onClick={() => togglePermission('inventario', 'verCostosUtilidad')}>
                              {editingRole.permissions.inventario.verCostosUtilidad ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />}
                            </div>
                            <span className="text-xs font-bold text-gray-600 select-none" onClick={() => togglePermission('inventario', 'verCostosUtilidad')}>Ver Costos y Utilidad</span>
                          </label>`;

const newCheckbox = `<label className="flex items-center gap-3 cursor-pointer group">
                            <div onClick={() => togglePermission('inventario', 'editarCostos')}>
                              {editingRole.permissions.inventario.editarCostos ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />}
                            </div>
                            <span className="text-xs font-bold text-gray-600 select-none" onClick={() => togglePermission('inventario', 'editarCostos')}>Editar Costos (Manual)</span>
                          </label>`;

if (code.includes(targetLabel)) {
  code = code.replace(targetLabel, targetLabel + '\n                          ' + newCheckbox);
  fs.writeFileSync('src/pages/Configuracion.tsx', code);
  console.log("Patch successful!");
} else {
  console.log("Could not find the target block.");
}
