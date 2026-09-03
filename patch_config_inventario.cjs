const fs = require('fs');
let code = fs.readFileSync('src/pages/Configuracion.tsx', 'utf8');

// Add "inventario" tab button
const oldTabEmpresa = `            <button 
              className={\`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 \${activeTab === 'empresa' ? 'bg-[#F8FAFC] text-[#0B1120] shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-700'}\`}
              onClick={() => setActiveTab('empresa')}
            >
              <Building2 className="w-3.5 h-3.5" /> Empresa
            </button>`;

const newTabInventario = `            <button 
              className={\`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 \${activeTab === 'empresa' ? 'bg-[#F8FAFC] text-[#0B1120] shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-700'}\`}
              onClick={() => setActiveTab('empresa')}
            >
              <Building2 className="w-3.5 h-3.5" /> Empresa
            </button>
            <button 
              className={\`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 \${activeTab === 'inventario' ? 'bg-[#F8FAFC] text-[#0B1120] shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-700'}\`}
              onClick={() => setActiveTab('inventario')}
            >
              <Settings className="w-3.5 h-3.5" /> Listas Default
            </button>`;

if (!code.includes("activeTab === 'inventario'")) {
  code = code.replace(oldTabEmpresa, newTabInventario);
}

// Ensure context destructuration includes inventoryConfig
if (!code.includes('inventoryConfig')) {
  code = code.replace('companyConfig, setCompanyConfig, sequencesConfig, setSequencesConfig } = useAppContext();', 'companyConfig, setCompanyConfig, sequencesConfig, setSequencesConfig, inventoryConfig, setInventoryConfig } = useAppContext();');
}

// Add state for localInventoryConfig
const stateInv = `
  const [localInventoryConfig, setLocalInventoryConfig] = useState(inventoryConfig);
  const handleSaveInventoryConfig = () => {
    setInventoryConfig(localInventoryConfig);
    showToast('Listas predeterminadas guardadas correctamente.');
  };
`;
if (!code.includes('localInventoryConfig')) {
  code = code.replace('const [toastMessage', stateInv + '\n  const [toastMessage');
}

const tabInventarioRender = `
        {activeTab === 'inventario' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-4xl mx-auto w-full mt-8">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-base font-bold text-[#0B1120] font-montserrat flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-600" />
                Listas Predeterminadas de Inventario
              </h3>
            </div>
            
            <div className="p-6">
              <p className="text-xs text-gray-500 mb-6">Estas listas se mostrarán como opciones en el formulario de "Registrar Producto" para evitar datos duplicados o con errores tipográficos.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Marcas de Repuesto */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Marcas de Repuesto</h4>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 font-bold">{localInventoryConfig.marcasRepuesto.length}</span>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-xl bg-gray-50 flex flex-col gap-2">
                    <input 
                      type="text" 
                      placeholder="Añadir marca (ej. ACDelco)" 
                      className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const val = e.currentTarget.value.trim().toUpperCase();
                          if (!localInventoryConfig.marcasRepuesto.includes(val)) {
                            setLocalInventoryConfig(prev => ({ ...prev, marcasRepuesto: [...prev.marcasRepuesto, val].sort() }));
                          }
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2 max-h-[150px] overflow-y-auto custom-scrollbar p-1">
                      {localInventoryConfig.marcasRepuesto.map(m => (
                        <div key={m} className="bg-white border border-gray-200 px-2 py-1 rounded-md text-[10px] font-bold text-gray-700 flex items-center gap-1 shadow-sm">
                          {m}
                          <button onClick={() => setLocalInventoryConfig(prev => ({ ...prev, marcasRepuesto: prev.marcasRepuesto.filter(x => x !== m) }))} className="text-gray-400 hover:text-red-500 ml-1"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Marcas Vehículo */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Marcas de Vehículo</h4>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 font-bold">{localInventoryConfig.marcasVehiculo.length}</span>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-xl bg-gray-50 flex flex-col gap-2">
                    <input 
                      type="text" 
                      placeholder="Añadir marca (ej. TOYOTA)" 
                      className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const val = e.currentTarget.value.trim().toUpperCase();
                          if (!localInventoryConfig.marcasVehiculo.includes(val)) {
                            setLocalInventoryConfig(prev => ({ ...prev, marcasVehiculo: [...prev.marcasVehiculo, val].sort() }));
                          }
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2 max-h-[150px] overflow-y-auto custom-scrollbar p-1">
                      {localInventoryConfig.marcasVehiculo.map(m => (
                        <div key={m} className="bg-white border border-gray-200 px-2 py-1 rounded-md text-[10px] font-bold text-gray-700 flex items-center gap-1 shadow-sm">
                          {m}
                          <button onClick={() => setLocalInventoryConfig(prev => ({ ...prev, marcasVehiculo: prev.marcasVehiculo.filter(x => x !== m) }))} className="text-gray-400 hover:text-red-500 ml-1"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Líneas */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Líneas</h4>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 font-bold">{localInventoryConfig.lineas.length}</span>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-xl bg-gray-50 flex flex-col gap-2">
                    <input 
                      type="text" 
                      placeholder="Añadir línea (ej. MOTOR)" 
                      className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const val = e.currentTarget.value.trim().toUpperCase();
                          if (!localInventoryConfig.lineas.includes(val)) {
                            setLocalInventoryConfig(prev => ({ ...prev, lineas: [...prev.lineas, val].sort() }));
                          }
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2 max-h-[150px] overflow-y-auto custom-scrollbar p-1">
                      {localInventoryConfig.lineas.map(m => (
                        <div key={m} className="bg-white border border-gray-200 px-2 py-1 rounded-md text-[10px] font-bold text-gray-700 flex items-center gap-1 shadow-sm">
                          {m}
                          <button onClick={() => setLocalInventoryConfig(prev => ({ ...prev, lineas: prev.lineas.filter(x => x !== m) }))} className="text-gray-400 hover:text-red-500 ml-1"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tipos de Repuesto */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Tipos de Repuesto</h4>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600 font-bold">{localInventoryConfig.tiposRepuesto.length}</span>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-xl bg-gray-50 flex flex-col gap-2">
                    <input 
                      type="text" 
                      placeholder="Añadir tipo (ej. ORIGINAL)" 
                      className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const val = e.currentTarget.value.trim().toUpperCase();
                          if (!localInventoryConfig.tiposRepuesto.includes(val)) {
                            setLocalInventoryConfig(prev => ({ ...prev, tiposRepuesto: [...prev.tiposRepuesto, val].sort() }));
                          }
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2 max-h-[150px] overflow-y-auto custom-scrollbar p-1">
                      {localInventoryConfig.tiposRepuesto.map(m => (
                        <div key={m} className="bg-white border border-gray-200 px-2 py-1 rounded-md text-[10px] font-bold text-gray-700 flex items-center gap-1 shadow-sm">
                          {m}
                          <button onClick={() => setLocalInventoryConfig(prev => ({ ...prev, tiposRepuesto: prev.tiposRepuesto.filter(x => x !== m) }))} className="text-gray-400 hover:text-red-500 ml-1"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
            <div className="p-6 bg-gray-50/80 border-t border-gray-100 flex justify-end">
              <button 
                onClick={handleSaveInventoryConfig}
                className="bg-[#2563EB] text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20 font-montserrat uppercase tracking-wider"
              >
                <Save className="w-4 h-4" />
                Guardar Listas
              </button>
            </div>
          </div>
        )}
`;

if (!code.includes("activeTab === 'inventario' && (")) {
  code = code.replace("{activeTab === 'empresa' && (", tabInventarioRender + "\n        {activeTab === 'empresa' && (");
}

fs.writeFileSync('src/pages/Configuracion.tsx', code);
console.log('Config patched');
