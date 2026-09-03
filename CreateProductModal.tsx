{isCreateModalOpen && (
        <div className="absolute inset-0 bg-[#0B1120]/40 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-black text-[#0B1120] font-montserrat tracking-tight">{isEditMode ? 'Editar Producto' : 'Registrar Nuevo Producto'}</h2>
              <button onClick={() => { setIsCreateModalOpen(false); setIsEditMode(false); }} className="text-gray-400 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar">
              {duplicateWarning && (
                <div className={`mb-4 p-3 rounded-lg border text-xs ${duplicateWarning.codeMatch ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${duplicateWarning.codeMatch ? 'text-red-600' : 'text-amber-600'}`} />
                    <div>
                      {duplicateWarning.codeMatch && (
                        <div className="font-bold mb-1">
                          ¡Alerta! El código "{duplicateWarning.codeMatch.codigo}" ya existe ({duplicateWarning.codeMatch.detalle}). No se puede duplicar.
                        </div>
                      )}
                      {duplicateWarning.similarProducts.length > 0 && (
                        <div>
                          <span className="font-bold">Productos con descripción similar encontrados:</span>
                          <ul className="list-disc pl-4 mt-1 opacity-90">
                            {duplicateWarning.similarProducts.map(p => (
                              <li key={p.codigo}>{p.codigo} - {p.detalle}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <form id="create-form" onSubmit={handleCreateProduct} className="flex flex-col gap-6">
                
                {/* SECCION 1: PRESENTACION */}
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 mb-2 border-b border-gray-200 pb-2">
                    <h3 className="text-sm font-bold text-[#0B1120]">1. Identificación</h3>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Código</label>
                    <Combobox 
                      value={newProduct.codigo || ''} 
                      onChange={val => setNewProduct({...newProduct, codigo: val})} 
                      options={codigos}
                      required 
                      className={`w-full p-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 transition-all ${duplicateWarning?.codeMatch && !isEditMode ? 'border-red-300 focus:ring-red-500/20' : 'border-gray-200 focus:ring-[#2563EB]/20'}`} 
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Código de Barras</label>
                    <input type="text" value={newProduct.codigoBarras || ''} onChange={e => setNewProduct({...newProduct, codigoBarras: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all" placeholder="Ej: 7591234567890" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Descripción</label>
                    <input required type="text" value={newProduct.detalle} onChange={e => setNewProduct({...newProduct, detalle: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Marca Repuesto</label>
                    <Combobox value={newProduct.marcaRepuesto || ''} onChange={val => setNewProduct({...newProduct, marcaRepuesto: val})} options={categories} className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Marca Vehículo</label>
                    <Combobox value={newProduct.marcaVehiculo || ''} onChange={val => setNewProduct({...newProduct, marcaVehiculo: val})} options={marcas} className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Línea</label>
                    <Combobox value={newProduct.linea || ''} onChange={val => setNewProduct({...newProduct, linea: val})} options={lineas} className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Tipo de Repuesto</label>
                    <Combobox value={newProduct.tipoRepuesto || ''} onChange={val => setNewProduct({...newProduct, tipoRepuesto: val})} options={[]} className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none" />
                  </div>
                </div>

                {/* SECCION 2: EMPAQUE Y COSTOS */}
                <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                  <div className="col-span-1 md:col-span-3 mb-2 border-b border-blue-100 pb-2 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-[#0B1120]">2. Configuración de Unidades y Costos</h3>
                  </div>

                  {/* EMPAQUE PRINCIPAL */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Unidad Principal</label>
                      <select 
                        value={newProduct.unidad || 'CAJA'} 
                        onChange={e => setNewProduct({...newProduct, unidad: e.target.value})} 
                        className="w-full p-2 border border-gray-200 rounded-lg text-xs font-bold bg-gray-50 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                      >
                        {(companyConfig?.packagingTypes || ['CAJA', 'UND', 'BLT', 'JGO', 'SET', 'PQT', 'PAR']).map(pkg => (
                          <option key={pkg} value={pkg}>{pkg}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center mt-4">
                      <label className="flex items-center cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={newProduct.unidadesPorEmpaque > 1}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewProduct({ ...newProduct, unidadesPorEmpaque: 2, empaqueBase: 'PIEZA' });
                            } else {
                              setNewProduct({ ...newProduct, unidadesPorEmpaque: 1, empaqueBase: undefined, precioSecundarioMayor: 0, precioSecundarioMinor: 0 });
                            }
                          }}
                          className="w-4 h-4 text-[#2563EB] bg-gray-100 border-gray-300 rounded focus:ring-[#2563EB] cursor-pointer"
                        />
                        <span className="ml-2 text-xs font-bold text-gray-700 uppercase tracking-wide group-hover:text-[#2563EB] transition-colors">
                          Lleva unidad secundaria
                        </span>
                      </label>
                    </div>

                    {newProduct.unidadesPorEmpaque > 1 && (
                      <div className="flex gap-2">
                        <div className="w-1/2">
                          <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">¿Cuántas?</label>
                          <input 
                            type="number" min="2" 
                            value={newProduct.unidadesPorEmpaque || ''} 
                            onChange={e => {
                              const val = Math.max(2, parseInt(e.target.value) || 2);
                              setNewProduct({
                                ...newProduct, 
                                unidadesPorEmpaque: val,
                                costoDolar: Number(((newProduct.costoEmpaque || 0) / val).toFixed(2)) // Auto calc secondary cost
                              });
                            }} 
                            className="w-full p-2 border border-gray-200 rounded-lg text-xs font-bold text-[#2563EB] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20" 
                          />
                        </div>
                        <div className="w-1/2">
                          <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Secundaria</label>
                          <select 
                            value={newProduct.empaqueBase || 'PIEZA'} 
                            onChange={e => setNewProduct({...newProduct, empaqueBase: e.target.value})} 
                            className="w-full p-2 border border-gray-200 rounded-lg text-xs font-bold bg-gray-50 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                          >
                            {(companyConfig?.packagingTypes || ['CAJA', 'UND', 'BLT', 'JGO', 'SET', 'PQT', 'PAR']).map(pkg => (
                              <option key={pkg} value={pkg}>{pkg}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                    
                    {!isEditMode && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                        Stock Inicial (en {newProduct.unidad || 'CAJA'}s)
                      </label>
                      <input 
                        type="number" min="0" step="0.01"
                        value={newProduct.stockDisp !== undefined ? newProduct.stockDisp : ''}
                        onChange={e => {
                          const val = Number(e.target.value) || 0;
                          setNewProduct({...newProduct, stockDisp: val});
                        }} 
                        className="w-full p-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 bg-gray-50 focus:bg-white focus:outline-none" 
                      />
                      {newProduct.unidadesPorEmpaque > 1 && newProduct.stockDisp > 0 && (
                        <div className="text-[9px] text-gray-400 mt-1 font-bold">
                          = {Math.floor(newProduct.stockDisp * newProduct.unidadesPorEmpaque)} {newProduct.empaqueBase}s
                        </div>
                      )}
                    </div>
                    )}
                  </div>

                  {/* COSTOS */}
                  <div className={`col-span-1 md:col-span-3 grid grid-cols-1 ${newProduct.unidadesPorEmpaque > 1 ? 'sm:grid-cols-2' : ''} gap-4`}>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                        Costo de {newProduct.unidad || 'CAJA'} (USD)
                      </label>
                      <input 
                        type="number" step="0.01" min="0" required
                        value={newProduct.costoEmpaque || ''} 
                        onChange={e => {
                          const val = Number(e.target.value);
                          const divisor = newProduct.unidadesPorEmpaque || 1;
                          setNewProduct({
                            ...newProduct, 
                            costoEmpaque: val,
                            costoDolar: Number((val / divisor).toFixed(2)) 
                          });
                        }} 
                        className={`w-full p-2 border border-gray-200 rounded-lg text-xs font-bold ${!userRole.permissions.inventario.editarCostos ? 'text-gray-500 bg-gray-100 cursor-not-allowed' : 'text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20'}`} 
                      />
                    </div>

                    {newProduct.unidadesPorEmpaque > 1 && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                        Costo de {newProduct.empaqueBase || 'PIEZA'} (USD) (Calculado)
                      </label>
                      <input 
                        type="number" step="0.001" min="0" disabled
                        value={newProduct.costoDolar || ''} 
                        className="w-full p-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 bg-gray-100 cursor-not-allowed" 
                      />
                    </div>
                    )}
                  </div>
                </div>

                {/* SECCION 3: PRECIOS Y RENTABILIDAD */}
                <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2 mb-2 border-b border-emerald-100 pb-2">
                    <h3 className="text-sm font-bold text-[#0B1120]">3. Precios de Venta</h3>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-sm col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2">
                      <h4 className="text-xs font-bold text-emerald-800 mb-2 uppercase border-b border-emerald-50 pb-1">Precios por {newProduct.unidad || 'CAJA'}</h4>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">Precio Mayorista</label>
                        <span className="text-[10px] font-bold text-emerald-600">
                          Mg: {newProduct.costoEmpaque && newProduct.precioMayor ? (((newProduct.precioMayor - newProduct.costoEmpaque) / newProduct.costoEmpaque) * 100).toFixed(0) : '0'}%
                        </span>
                      </div>
                      <input 
                        required type="number" step="0.01" min="0"
                        value={newProduct.precioMayor || ''} 
                        onChange={e => setNewProduct({...newProduct, precioMayor: Number(e.target.value)})} 
                        className="w-full p-2 border border-emerald-200 rounded-lg text-xs font-black text-emerald-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">Precio Minorista</label>
                        <span className="text-[10px] font-bold text-emerald-600">
                          Mg: {newProduct.costoEmpaque && newProduct.precioMinor ? (((newProduct.precioMinor - newProduct.costoEmpaque) / newProduct.costoEmpaque) * 100).toFixed(0) : '0'}%
                        </span>
                      </div>
                      <input 
                        required type="number" step="0.01" min="0"
                        value={newProduct.precioMinor || ''} 
                        onChange={e => setNewProduct({...newProduct, precioMinor: Number(e.target.value)})} 
                        className="w-full p-2 border border-emerald-200 rounded-lg text-xs font-black text-emerald-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                      />
                    </div>

                    {newProduct.unidadesPorEmpaque > 1 && (
                      <>
                        <div className="col-span-1 sm:col-span-2 mt-2 pt-2 border-t border-emerald-50">
                          <h4 className="text-xs font-bold text-emerald-800 mb-2 uppercase border-b border-emerald-50 pb-1">Precios por {newProduct.empaqueBase || 'PIEZA'}</h4>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">Precio Mayorista (Secundaria)</label>
                            <span className="text-[10px] font-bold text-emerald-600">
                              Mg: {newProduct.costoDolar && newProduct.precioSecundarioMayor ? (((newProduct.precioSecundarioMayor - newProduct.costoDolar) / newProduct.costoDolar) * 100).toFixed(0) : '0'}%
                            </span>
                          </div>
                          <input 
                            type="number" step="0.01" min="0"
                            value={newProduct.precioSecundarioMayor || ''} 
                            onChange={e => setNewProduct({...newProduct, precioSecundarioMayor: Number(e.target.value)})} 
                            className="w-full p-2 border border-emerald-200 rounded-lg text-xs font-black text-emerald-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">Precio Minorista (Secundaria)</label>
                            <span className="text-[10px] font-bold text-emerald-600">
                              Mg: {newProduct.costoDolar && newProduct.precioSecundarioMinor ? (((newProduct.precioSecundarioMinor - newProduct.costoDolar) / newProduct.costoDolar) * 100).toFixed(0) : '0'}%
                            </span>
                          </div>
                          <input 
                            type="number" step="0.01" min="0"
                            value={newProduct.precioSecundarioMinor || ''} 
                            onChange={e => setNewProduct({...newProduct, precioSecundarioMinor: Number(e.target.value)})} 
                            className="w-full p-2 border border-emerald-200 rounded-lg text-xs font-black text-emerald-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100 col-span-1 md:col-span-2">
                  <button type="button" onClick={() => { setIsCreateModalOpen(false); setIsEditMode(false); }} className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancelar</button>
                  <button type="submit" className="bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-md flex items-center gap-2">
                    <Save className="w-4 h-4" /> {isEditMode ? 'Guardar Cambios' : 'Registrar Producto'}
                  </button>
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 shrink-0 bg-gray-50/50 rounded-b-2xl">
              <button onClick={() => { setIsCreateModalOpen(false); setIsEditMode(false); }} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">Cancelar</button>
              <button type="submit" form="create-form" disabled={!!duplicateWarning?.codeMatch && !isEditMode} className={`px-4 py-2 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm ${(duplicateWarning?.codeMatch && !isEditMode) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2563EB] hover:bg-blue-700'}`}><Save className="w-3.5 h-3.5" /> Guardar Producto</button>
            </div>
          </div>
        </div>
      )}