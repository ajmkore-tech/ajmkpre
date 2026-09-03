const fs = require('fs');
let code = fs.readFileSync('src/pages/Inventory.tsx', 'utf8');

// 1. We replace the cost section in the modal.
const oldCostosBlock = `{/* COSTOS */}
                  <div className={\`col-span-1 md:col-span-3 grid grid-cols-1 \${newProduct.unidadesPorEmpaque > 1 ? 'sm:grid-cols-2' : ''} gap-4\`}>
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
                        className="w-full p-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20" 
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
                  </div>`;

const newCostosBlock = `{/* COSTOS */}
                  <div className="col-span-1 md:col-span-3">
                    <div className="flex justify-between items-center mb-2">
                       <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">Costos (Base: {newProduct.empaqueBase || newProduct.unidad || 'UNIDAD'})</label>
                       {newProduct.historialCostos && newProduct.historialCostos.length > 0 && (
                          <button type="button" onClick={() => setViewHistoryProduct(newProduct)} className="text-[10px] font-bold text-blue-600 hover:underline">Ver Historial</button>
                       )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 mb-1 uppercase tracking-wide">
                          Último Costo (USD)
                        </label>
                        <input 
                          type="number" step="0.001" min="0" required
                          value={newProduct.ultimoCosto || newProduct.costoDolar || ''} 
                          onChange={e => {
                            const val = Number(e.target.value);
                            setNewProduct({
                              ...newProduct, 
                              ultimoCosto: val,
                              costoDolar: val // Keep backward compatibility for now
                            });
                          }} 
                          className="w-full p-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20" 
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 mb-1 uppercase tracking-wide">
                          Costo Promedio (USD)
                        </label>
                        <input 
                          type="number" step="0.001" min="0" required
                          value={newProduct.costoPromedio || ''} 
                          onChange={e => {
                            const val = Number(e.target.value);
                            setNewProduct({
                              ...newProduct, 
                              costoPromedio: val
                            });
                          }} 
                          className="w-full p-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20" 
                        />
                      </div>
                    </div>
                  </div>`;

code = code.replace(oldCostosBlock, newCostosBlock);

// Replace state definition to add viewHistoryProduct
code = code.replace(
  "const [packedViewMode, setPackedViewMode] = useState<{ [key: string]: boolean }>({});",
  "const [packedViewMode, setPackedViewMode] = useState<{ [key: string]: boolean }>({});\n  const [viewHistoryProduct, setViewHistoryProduct] = useState<any>(null);"
);

// Add the History Modal component at the end of the return statement before the last </div>
const historyModal = `
      {viewHistoryProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="font-black text-[#0B1120] uppercase tracking-wider text-sm">Historial de Costos</h3>
                <p className="text-xs font-medium text-gray-500 mt-0.5">{viewHistoryProduct.detalle}</p>
              </div>
              <button onClick={() => setViewHistoryProduct(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh] custom-scrollbar">
              {(!viewHistoryProduct.historialCostos || viewHistoryProduct.historialCostos.length === 0) ? (
                <div className="text-center text-sm font-medium text-gray-500 py-8">No hay historial registrado.</div>
              ) : (
                <div className="space-y-3">
                  {viewHistoryProduct.historialCostos.map((hist: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div>
                        <div className="text-xs font-bold text-[#0B1120] mb-0.5">{hist.proveedorNombre}</div>
                        <div className="text-[10px] font-medium text-gray-500">Ref: {hist.referencia} • {new Date(hist.fecha).toLocaleDateString()}</div>
                      </div>
                      <div className="text-sm font-black text-[#2563EB] bg-blue-50 px-2 py-1 rounded">
                        \${hist.costo.toFixed(3)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(/\{isImportModalOpen && \(/, historyModal + '\n      {isImportModalOpen && (');

fs.writeFileSync('src/pages/Inventory.tsx', code);
