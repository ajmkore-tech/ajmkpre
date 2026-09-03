const fs = require('fs');
let code = fs.readFileSync('src/pages/Clients.tsx', 'utf8');

// Also update initial state in openProviderModal
code = code.replace(
  /setEditingProvider\(\{[\s\S]*?id: Math\.random\(\)\.toString\(36\)\.substr\(2, 9\),[\s\S]*?razonSocial: '',[\s\S]*?rif: '',[\s\S]*?direccion: '',[\s\S]*?telefono: ''[\s\S]*?\}\);/,
  `setEditingProvider({
        id: Math.random().toString(36).substr(2, 9),
        tipoProveedor: 'J',
        razonSocial: '',
        rif: '',
        direccion: '',
        telefono: '',
        email: '',
        credito: false,
        diasCredito: 0
      });`
);

const oldModalContent = `<div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">RIF / Cédula</label>
                  <input
                    type="text"
                    value={editingProvider.rif}
                    onChange={e => setEditingProvider({...editingProvider, rif: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-mono uppercase"
                    placeholder="J123456789"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Razón Social</label>
                  <input
                    type="text"
                    value={editingProvider.razonSocial}
                    onChange={e => setEditingProvider({...editingProvider, razonSocial: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all uppercase"
                    placeholder="NOMBRE O EMPRESA"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Dirección</label>
                  <input
                    type="text"
                    value={editingProvider.direccion}
                    onChange={e => setEditingProvider({...editingProvider, direccion: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all uppercase"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Teléfono</label>
                  <input
                    type="text"
                    value={editingProvider.telefono}
                    onChange={e => setEditingProvider({...editingProvider, telefono: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  />
                </div>`;

const newModalContent = `<div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Tipo y RIF/Cédula</label>
                  <div className="flex gap-2">
                    <select
                      value={editingProvider.tipoProveedor || 'J'}
                      onChange={e => setEditingProvider({...editingProvider, tipoProveedor: e.target.value as any})}
                      className="w-20 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    >
                      <option value="V">V</option>
                      <option value="J">J</option>
                      <option value="E">E</option>
                      <option value="G">G</option>
                    </select>
                    <input
                      type="text"
                      value={editingProvider.rif}
                      onChange={e => setEditingProvider({...editingProvider, rif: e.target.value})}
                      className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-mono uppercase"
                      placeholder="123456789"
                    />
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Razón Social / Nombre</label>
                  <input
                    type="text"
                    value={editingProvider.razonSocial}
                    onChange={e => setEditingProvider({...editingProvider, razonSocial: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all uppercase"
                    placeholder="NOMBRE O EMPRESA"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Dirección</label>
                  <input
                    type="text"
                    value={editingProvider.direccion}
                    onChange={e => setEditingProvider({...editingProvider, direccion: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all uppercase"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Teléfono</label>
                  <input
                    type="text"
                    value={editingProvider.telefono}
                    onChange={e => setEditingProvider({...editingProvider, telefono: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Correo Electrónico</label>
                  <input
                    type="email"
                    value={editingProvider.email || ''}
                    onChange={e => setEditingProvider({...editingProvider, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="ejemplo@correo.com"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Condición de Pago</label>
                  <div className="flex items-center gap-4 h-[42px]">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingProvider.credito || false}
                        onChange={e => setEditingProvider({...editingProvider, credito: e.target.checked, diasCredito: e.target.checked ? (editingProvider.diasCredito || 15) : 0})}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      Permite Crédito
                    </label>
                    {editingProvider.credito && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editingProvider.diasCredito || ''}
                          onChange={e => setEditingProvider({...editingProvider, diasCredito: parseInt(e.target.value) || 0})}
                          className="w-20 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                          placeholder="Días"
                        />
                        <span className="text-xs text-gray-500 font-bold">Días</span>
                      </div>
                    )}
                  </div>
                </div>`;

code = code.replace(oldModalContent, newModalContent);
fs.writeFileSync('src/pages/Clients.tsx', code);
