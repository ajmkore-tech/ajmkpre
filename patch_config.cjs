const fs = require('fs');
let code = fs.readFileSync('src/pages/Configuracion.tsx', 'utf8');

// Also update initial state in handleAddRole
code = code.replace(
  /ventas: \{\s*verPrecioMayorista: false,\s*editarPrecio: false,\s*\}/,
  "ventas: { verPrecioMayorista: false, editarPrecio: false, editarTasa: false }"
);

const oldCheckbox = `<label className="flex items-center gap-3 cursor-pointer group">
                            <div onClick={() => togglePermission('ventas', 'editarPrecio')}>
                              {editingRole.permissions.ventas.editarPrecio ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />}
                            </div>
                            <span className="text-xs font-bold text-gray-600 select-none" onClick={() => togglePermission('ventas', 'editarPrecio')}>Permitir Editar Precio/Costo manualmente</span>
                          </label>`;

const newCheckbox = `<label className="flex items-center gap-3 cursor-pointer group">
                            <div onClick={() => togglePermission('ventas', 'editarPrecio')}>
                              {editingRole.permissions.ventas.editarPrecio ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />}
                            </div>
                            <span className="text-xs font-bold text-gray-600 select-none" onClick={() => togglePermission('ventas', 'editarPrecio')}>Permitir Editar Precio/Costo manualmente</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div onClick={() => togglePermission('ventas', 'editarTasa')}>
                              {editingRole.permissions.ventas.editarTasa ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />}
                            </div>
                            <span className="text-xs font-bold text-gray-600 select-none" onClick={() => togglePermission('ventas', 'editarTasa')}>Permitir Editar/Seleccionar Tasa</span>
                          </label>`;

code = code.replace(oldCheckbox, newCheckbox);
fs.writeFileSync('src/pages/Configuracion.tsx', code);
