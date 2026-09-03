const fs = require('fs');
let code = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

const startStr = '<div className="flex-1 flex flex-col bg-white overflow-hidden relative">';
const endStr = '          </div>\n        ) : (\n          <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">';

const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
    const replacement = `<div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden relative">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6">
              <button onClick={() => setSelectedSale(null)} className="lg:hidden mb-4 text-sm font-bold text-gray-500 hover:text-[#2563EB] flex items-center gap-1 transition-colors"><ArrowLeft className="w-4 h-4" /> Volver a Pedidos</button>
              
              <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h2 className="text-2xl font-black text-[#0B1120] font-mono">{selectedSale.id}</h2>
                    {selectedSale.numeroDocumento && (
                      <span className="text-sm font-bold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                        {selectedSale.tipoDocumento === 'Factura' ? 'Factura' : 'Nota'} #{selectedSale.numeroDocumento}
                      </span>
                    )}
                    <div className={\`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider \${getStatusColor(selectedSale.estado)}\`}>
                      {getStatusIcon(selectedSale.estado)} {selectedSale.estado}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-gray-600">{new Date(selectedSale.fecha).toLocaleString()}</div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {canPrintDocument(selectedSale) && (
                    <button 
                      onClick={() => generateDocument(selectedSale)}
                      className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-100"
                      title="Imprimir Documento"
                    >
                      <FileText className="w-3.5 h-3.5" /> {selectedSale.numeroDocumento ? 'Ver Documento' : 'Generar PDF'}
                    </button>
                  )}
                  {selectedSale.estado !== 'Cerrado' && (
                    <button 
                      onClick={() => handleDeleteSale(selectedSale.id)}
                      className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-red-100 transition-all border border-red-100"
                      title="Eliminar pedido y reversar inventario"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Eliminar
                    </button>
                  )}
                  {getNextStatusAction(selectedSale) && (
                    <button 
                      onClick={() => advanceStatus(selectedSale.id)}
                      className="bg-[#0B1120] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-sm"
                    >
                      {getNextStatusAction(selectedSale)} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              
              {selectedSale.anulado && <div className="bg-red-600 text-white font-black text-center py-2 px-4 rounded-xl mb-4 uppercase tracking-wider text-sm">ANULADO POR {selectedSale.anuladoPor?.toUpperCase()}</div>}

              {/* Unified Document Block */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col mb-6">
                 
                 {/* Top Section: Client condensed */}
                 <div className="p-4 border-b border-gray-100 flex justify-between items-start sm:items-center bg-gray-50/50 flex-col sm:flex-row gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-[#0B1120] uppercase tracking-wider">{selectedSale.clienteNombre}</h3>
                        {selectedSale.estado !== 'Cerrado' && (
                           <button onClick={() => handleEditSale(selectedSale)} className="p-1 hover:bg-gray-200 text-gray-500 rounded transition-colors" title="Editar Pedido">
                              <FileEdit className="w-3.5 h-3.5" />
                           </button>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 font-bold mt-0.5 uppercase tracking-wider">
                         RIF: {clients.find(c => c.id === selectedSale.clienteId)?.rif || selectedSale.clienteId} • {clients.find(c => c.id === selectedSale.clienteId)?.telefono || 'S/N'}
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-start sm:items-end gap-1">
                       <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase">{selectedSale.tipoPrecio}</span>
                       <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase">{selectedSale.condicionPago}</span>
                    </div>
                 </div>

                 {/* Articles Table */}
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] border-b border-gray-200 text-gray-500 uppercase font-bold text-[9px] tracking-wider">
                        <tr>
                          <th className="px-3 py-2">Código</th>
                          <th className="px-3 py-2">Descripción</th>
                          <th className="px-3 py-2 text-right">Cant.</th>
                          <th className="px-3 py-2 text-right">P. Unit</th>
                          <th className="px-3 py-2 text-right text-[#0B1120]">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedSale.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-2 font-mono font-bold text-[#2563EB]">{item.codigo}</td>
                            <td className="px-3 py-2 min-w-[200px]">
                              <div className="font-medium text-gray-800">{item.detalle}</div>
                              <div className="text-[9px] text-gray-400 mt-0.5">{item.marcaRepuesto} &middot; {item.marcaVehiculo}</div>
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-gray-600">{item.cantidad}</td>
                            <td className="px-3 py-2 text-right text-gray-600">\${item.precio.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right font-black text-[#10B981]">\${item.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>

                 {/* Totals Section */}
                 <div className="p-4 bg-gray-50/50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-end gap-6 shrink-0">
                    {selectedSale.tipoDocumento === 'Factura' && (
                      <div className="flex items-center justify-end gap-6">
                        <div className="flex flex-col text-right">
                          <span className="text-[9px] font-bold text-gray-500 uppercase">Subtotal</span>
                          <span className="text-sm font-bold text-gray-700">\${(selectedSale.total / (1 + (companyConfig.ivaVenta ?? 16) / 100)).toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[9px] font-bold text-gray-500 uppercase">IVA ({companyConfig.ivaVenta ?? 16}%)</span>
                          <span className="text-sm font-bold text-gray-700">\${(selectedSale.total - (selectedSale.total / (1 + (companyConfig.ivaVenta ?? 16) / 100))).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col text-right sm:pl-6 sm:border-l sm:border-gray-200 mt-2 sm:mt-0">
                      <span className="text-[9px] font-bold text-gray-500 uppercase">Total {selectedSale.tipoDocumento === 'Factura' ? '(con IVA)' : ''}</span>
                      <div className="flex items-baseline gap-2 justify-end">
                        <span className="text-2xl font-black text-[#10B981] leading-none">\${selectedSale.total.toFixed(2)}</span>
                        <span className="text-[10px] font-bold text-gray-400">Bs. {(selectedSale.total * (selectedSale.tasaAplicada || 1)).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                 </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Auditoría</h4>
                <div className="space-y-1">
                  {selectedSale.auditLog?.map((log, idx) => (
                    <div key={idx} className="flex gap-4 text-[10px]">
                      <span className="text-gray-400 min-w-[120px] font-mono">{new Date(log.date).toLocaleString('es-VE')}</span>
                      <span className="text-gray-700 font-medium">{log.action}</span>
                    </div>
                  )) || <div className="text-[10px] text-gray-400 italic">No hay registros de auditoría</div>}
                </div>
              </div>
              
`;
    
    code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
    fs.writeFileSync('src/pages/Sales.tsx', code);
    console.log("Patched successfully!");
} else {
    console.log("Could not find start or end index.");
}
