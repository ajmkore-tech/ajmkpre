{isDetailModalOpen && selectedProduct && (
        <div className="absolute inset-0 bg-[#0B1120]/40 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative border border-gray-100 flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-black text-[#0B1120] font-montserrat tracking-tight">Ficha del Producto</h2>
              <div className="flex gap-2">
                <button onClick={() => {
                  setNewProduct({
                    ...selectedProduct,
                    costoEmpaque: selectedProduct.costoEmpaque || Number((selectedProduct.costoDolar * (selectedProduct.unidadesPorEmpaque || 1)).toFixed(2))
                  });
                  setIsEditMode(true);
                  setIsCreateModalOpen(true);
                  setIsDetailModalOpen(false);
                }} className="px-3 py-1.5 border border-gray-200 text-[#0B1120] rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:bg-gray-50 transition-colors">
                  <FileEdit className="w-3 h-3" /> Editar
                </button>
                <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors"><X className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Image Section */}
                <div className="w-full md:w-1/3 flex flex-col gap-3">
                  <div className="aspect-square bg-white border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-xs font-bold">Sin foto principal</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="aspect-square bg-white border border-gray-200 rounded-lg flex items-center justify-center"><ImageIcon className="w-6 h-6 text-gray-300" /></div>
                    <div className="aspect-square bg-white border border-gray-200 rounded-lg flex items-center justify-center"><ImageIcon className="w-6 h-6 text-gray-300" /></div>
                    <div className="aspect-square bg-white border border-dashed border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100 cursor-pointer transition-colors"><Plus className="w-6 h-6 text-gray-400" /></div>
                  </div>
                  {selectedProduct.codigoBarras && (
                    <div className="mt-2 bg-white p-3 rounded-xl border border-gray-200 flex flex-col items-center justify-center shadow-sm">
                      <ReactBarcode value={selectedProduct.codigoBarras} width={1.8} height={50} fontSize={14} background="#ffffff" lineColor="#000000" margin={0} />
                    </div>
                  )}
                </div>
                
                {/* Details Section */}
                <div className="w-full md:w-2/3 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-black text-[#0B1120] leading-tight mb-1">{selectedProduct.detalle}</h3>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#2563EB] font-bold bg-blue-50 px-2 py-0.5 rounded text-xs">{selectedProduct.codigo}</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{selectedProduct.marcaVehiculo}</span>
                      </div>
                    </div>
                    {/* Precios Principales - Arriba */}
                    <div className="flex gap-4 text-right">
                      <div className="group">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0 transition-colors">Precio Mayorista</div>
                        <div className="text-xl font-black text-[#10B981]">
                          {packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 
                            ? (selectedProduct.precioSecundarioMayor ? "$" + selectedProduct.precioSecundarioMayor.toFixed(2) : 'S/P') 
                            : "$" + (selectedProduct.precioMayor?.toFixed(2) || '0.00')}
                        </div>
                        <div className="text-[9px] text-gray-400 font-medium">
                          {packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 
                            ? (selectedProduct.precioSecundarioMayor ? formatBs(selectedProduct.precioSecundarioMayor) : 'S/P')
                            : (selectedProduct.precioMayor ? formatBs(selectedProduct.precioMayor) : 'S/P')}
                        </div>
                      </div>
                      <div className="group">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0 transition-colors">Precio Minorista</div>
                        <div className="text-xl font-black text-[#10B981]">
                          {packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 
                            ? (selectedProduct.precioSecundarioMinor ? "$" + selectedProduct.precioSecundarioMinor.toFixed(2) : 'S/P') 
                            : "$" + (selectedProduct.precioMinor?.toFixed(2) || '0.00')}
                        </div>
                        <div className="text-[9px] text-gray-400 font-medium">
                          {packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 
                            ? (selectedProduct.precioSecundarioMinor ? formatBs(selectedProduct.precioSecundarioMinor) : 'S/P')
                            : (selectedProduct.precioMinor ? formatBs(selectedProduct.precioMinor) : 'S/P')}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stock Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div 
                      className={`bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center ${selectedProduct.unidadesPorEmpaque > 1 ? 'cursor-pointer hover:bg-gray-50 group transition-all' : ''}`}
                      onClick={(e) => {
                         if (selectedProduct.unidadesPorEmpaque > 1) togglePackedView(e, selectedProduct.codigo);
                      }}
                      title={selectedProduct.unidadesPorEmpaque > 1 ? "Clic para alternar vista de unidades" : ""}
                    >
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 transition-colors group-hover:text-[#10B981]">Disp</div>
                      <>
                        {packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 ? (
                          <div className={`flex items-baseline gap-1.5 text-lg font-black ${selectedProduct.stockDisp > 0 ? 'text-[#10B981]' : 'text-red-500'}`}>
                            {Number((selectedProduct.stockDisp * selectedProduct.unidadesPorEmpaque).toFixed(2))}
                            <span className="text-[10px] font-bold text-gray-400 align-middle pb-0.5 uppercase">{selectedProduct.empaqueBase}</span>
                          </div>
                        ) : (
                          <div className={`flex items-baseline gap-1.5 text-lg font-black ${selectedProduct.stockDisp > 0 ? 'text-[#10B981]' : 'text-red-500'}`}>
                            {Number(selectedProduct.stockDisp.toFixed(2))}
                            <span className="text-[10px] font-bold text-gray-400 align-middle pb-0.5 uppercase">{selectedProduct.unidad}</span>
                          </div>
                        )}
                      </>
                    </div>
                    <div 
                        className={`bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center ${selectedProduct.unidadesPorEmpaque > 1 ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
                        onClick={(e) => { if (selectedProduct.unidadesPorEmpaque > 1) togglePackedView(e, selectedProduct.codigo); }}
                        title={selectedProduct.unidadesPorEmpaque > 1 ? "Clic para alternar vista de unidades" : ""}
                      >
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Comp</div>
                      <div 
                        className={`flex items-baseline gap-1.5 text-lg font-black text-orange-500 ${selectedProduct.stockComp > 0 ? 'cursor-pointer hover:underline' : ''}`}
                        onClick={(e) => { e.stopPropagation(); if(selectedProduct.stockComp > 0) setCommittedProduct(selectedProduct); }}
                      >
                        {packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 
                           ? Number((selectedProduct.stockComp * selectedProduct.unidadesPorEmpaque).toFixed(2)) 
                           : selectedProduct.stockComp}
                      </div>
                    </div>
                    <div 
                        className={`bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center ${selectedProduct.unidadesPorEmpaque > 1 ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
                        onClick={(e) => { if (selectedProduct.unidadesPorEmpaque > 1) togglePackedView(e, selectedProduct.codigo); }}
                        title={selectedProduct.unidadesPorEmpaque > 1 ? "Clic para alternar vista de unidades" : ""}
                    >
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Tránsito</div>
                      <div className="flex items-baseline gap-1.5 text-lg font-black text-purple-600">
                        {packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 
                           ? Number((selectedProduct.stockTrans * selectedProduct.unidadesPorEmpaque).toFixed(2)) 
                           : selectedProduct.stockTrans}
                      </div>
                    </div>
                  </div>

                  {/* Margins & Costs Grid */}
                  {userRole.permissions.inventario.verCostosUtilidad && (
                    <div className="grid grid-cols-3 gap-3">
                      <div 
                        className={`bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center text-center relative overflow-hidden ${selectedProduct.unidadesPorEmpaque > 1 ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
                        onClick={(e) => { if (selectedProduct.unidadesPorEmpaque > 1) togglePackedView(e, selectedProduct.codigo); }}
                        title={selectedProduct.unidadesPorEmpaque > 1 ? "Clic para alternar vista de unidades" : ""}
                      >
                        <div className="absolute top-0 right-0 p-1 opacity-5"><DollarSign className="w-8 h-8" /></div>
                        <div className="flex justify-between items-center px-1 mb-1 relative z-10 border-b border-gray-50 pb-1">
                          <div className="text-[8px] font-bold text-gray-400 uppercase">Último Costo</div>
                          <div className="text-[9px] font-medium text-gray-400 line-through">
                            {"$"}{packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 
                              ? ((selectedProduct.costoAnterior || 0) / selectedProduct.unidadesPorEmpaque).toFixed(2)
                              : (selectedProduct.costoAnterior || 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider mt-1 relative z-10">Costo Promedio</div>
                        <div className="text-base font-black text-[#0B1120] relative z-10">
                          {"$"}{packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 
                            ? ((selectedProduct.costoPromedio || 0) / selectedProduct.unidadesPorEmpaque).toFixed(2)
                            : (selectedProduct.costoPromedio || 0).toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-[#10B981]/5 p-2 rounded-lg shadow-sm border border-[#10B981]/20 flex flex-col justify-center text-center">
                        <div className="text-[9px] font-bold text-[#10B981] uppercase tracking-wider mb-0.5">Utilidad Mayorista</div>
                        <div className="text-base font-black text-[#0B1120]">
                          {packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 
                            ? (selectedProduct.costoPromedio && selectedProduct.precioSecundarioMayor
                                ? (((selectedProduct.precioSecundarioMayor - (selectedProduct.costoPromedio / selectedProduct.unidadesPorEmpaque)) / (selectedProduct.costoPromedio / selectedProduct.unidadesPorEmpaque)) * 100).toFixed(1) + '%'
                                : '0.0%')
                            : (selectedProduct.costoPromedio && selectedProduct.precioMayor 
                                ? (((selectedProduct.precioMayor - selectedProduct.costoPromedio) / selectedProduct.costoPromedio) * 100).toFixed(1) + '%'
                                : '0.0%')
                          }
                        </div>
                      </div>
                      <div className="bg-[#10B981]/5 p-2 rounded-lg shadow-sm border border-[#10B981]/20 flex flex-col justify-center text-center">
                        <div className="text-[9px] font-bold text-[#10B981] uppercase tracking-wider mb-0.5">Utilidad Minorista</div>
                        <div className="text-base font-black text-[#0B1120]">
                          {packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 
                            ? (selectedProduct.costoPromedio && selectedProduct.precioSecundarioMinor
                                ? (((selectedProduct.precioSecundarioMinor - (selectedProduct.costoPromedio / selectedProduct.unidadesPorEmpaque)) / (selectedProduct.costoPromedio / selectedProduct.unidadesPorEmpaque)) * 100).toFixed(1) + '%'
                                : '0.0%')
                            : (selectedProduct.costoPromedio && selectedProduct.precioMinor 
                                ? (((selectedProduct.precioMinor - selectedProduct.costoPromedio) / selectedProduct.costoPromedio) * 100).toFixed(1) + '%'
                                : '0.0%')
                          }
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-3 py-1.5 border-b border-gray-100 bg-gray-50/50">
                      <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Información Adicional</h4>
                    </div>
                    <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4">
                      <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Línea</div>
                        <div className="text-xs font-bold text-[#0B1120]">{selectedProduct.linea}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Proveedor</div>
                        <div className="text-xs font-bold text-[#0B1120] truncate" title={selectedProduct.proveedor}>{selectedProduct.proveedor}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Marca Repuesto</div>
                        <div className="text-xs font-bold text-[#0B1120]">{selectedProduct.marcaRepuesto || '-'}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Tipo Repuesto</div>
                        <div className="text-xs font-bold text-[#0B1120]">{selectedProduct.tipoRepuesto || '-'}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Referencia</div>
                        <div className="text-xs font-bold text-[#0B1120]">{selectedProduct.referencia || '-'}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Modelo</div>
                        <div className="text-xs font-bold text-[#0B1120]">{selectedProduct.modelo || '-'}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Procedencia</div>
                        <div className="text-xs font-bold text-[#0B1120]">{selectedProduct.procedencia || '-'}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Empaque</div>
                        <div className="text-xs font-bold text-[#0B1120]">
                          {selectedProduct.unidadesPorEmpaque > 1 ? selectedProduct.unidad : 'N/A'}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Relación Empaque</div>
                        <div className="text-xs font-bold text-[#2563EB]">
                          {selectedProduct.empaqueBase && selectedProduct.unidadesPorEmpaque > 1
                            ? `1 ${selectedProduct.unidad} = ${selectedProduct.unidadesPorEmpaque} ${selectedProduct.empaqueBase}s`
                            : '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Estatus</div>
                        <div className="text-xs font-bold text-[#0B1120]">Activo</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}