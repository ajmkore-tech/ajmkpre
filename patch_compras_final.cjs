const fs = require('fs');
let code = fs.readFileSync('src/pages/Compras.tsx', 'utf8');

// 1. Modal size
code = code.replace(
  /<div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-\[90vh\]">/,
  '<div className="bg-white rounded-xl w-full max-w-[98vw] shadow-2xl overflow-hidden flex flex-col h-[96vh]">'
);

// 2. Factura mandatory
code = code.replace(
  /<label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Factura Prov\. \(Opcional\)<\/label>/,
  '<label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Factura Prov. *</label>'
);
code = code.replace(
  /type="text"\s*value=\{editingPurchase\.numeroFactura \|\| ''\}/,
  'type="text"\n                      required\n                      value={editingPurchase.numeroFactura || \'\'}'
);

// Add alert in handleSavePurchase
code = code.replace(
  /if \(!editingPurchase\.proveedorNombre\) return alert\('Seleccione un proveedor'\);/,
  "if (!editingPurchase.proveedorNombre) return alert('Seleccione un proveedor');\n    if (!editingPurchase.numeroFactura) return alert('El número de factura es obligatorio');"
);

// 3. Update the table row for Detalle and EsCaja
const oldRow = `<td className="px-2 py-1.5 relative">
                              <input 
                                type="text" 
                                placeholder="Cód/Busc" 
                                value={item.codigo}
                                onChange={e => {
                                  handlePurchaseItemChange(index, 'codigo', e.target.value);
                                  setProductSearch(e.target.value);
                                }}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs uppercase font-mono bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                              />
                              {item.codigo.length > 2 && productSearch === item.codigo && (
                                <div className="absolute top-full left-0 w-80 bg-white border border-gray-200 shadow-xl rounded-lg mt-1 z-50 max-h-48 overflow-y-auto custom-scrollbar">
                                  {inventory.filter(p => p.codigo.includes(item.codigo.toUpperCase()) || p.detalle.includes(item.codigo.toUpperCase())).slice(0, 10).map(p => (
                                    <div key={p.id} onClick={() => {handleProductSelect(index, p); setProductSearch('');}} className="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100">
                                      <div className="font-mono text-xs font-bold text-blue-600">{p.codigo}</div>
                                      <div className="text-xs font-medium truncate">{p.detalle}</div>
                                      <div className="text-[10px] text-gray-500 mt-1 flex gap-2">
                                        <span>Stock: <b className="text-gray-700">{p.stockDisp}</b></span>
                                        <span>Últ. Costo: <b className="text-gray-700">\\$\${p.costoDolar?.toFixed(2) || '0.00'}</b></span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-2 py-1.5">
                              <input 
                                type="text" 
                                placeholder="Detalle" 
                                value={item.detalle}
                                onChange={e => handlePurchaseItemChange(index, 'detalle', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs uppercase outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <select 
                                value={item.esCaja ? 'true' : 'false'}
                                onChange={e => handlePurchaseItemChange(index, 'esCaja', e.target.value === 'true')}
                                className="w-full px-1 py-1 border border-gray-200 rounded text-xs bg-white outline-none"
                              >
                                <option value="true">Prin.</option>
                                <option value="false">Sec.</option>
                              </select>
                            </td>`;

const newRow = `<td className="px-2 py-1.5 relative">
                              <input 
                                type="text" 
                                placeholder="Cód/Busc" 
                                value={item.codigo}
                                onChange={e => {
                                  handlePurchaseItemChange(index, 'codigo', e.target.value);
                                  setProductSearch(e.target.value);
                                }}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs uppercase font-mono bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                              />
                              {item.codigo.length > 2 && productSearch === item.codigo && (
                                <div className="absolute top-full left-0 w-[400px] bg-white border border-gray-200 shadow-xl rounded-lg mt-1 z-50 max-h-48 overflow-y-auto custom-scrollbar">
                                  {inventory.filter(p => p.codigo.includes(item.codigo.toUpperCase()) || p.detalle.includes(item.codigo.toUpperCase())).slice(0, 15).map(p => (
                                    <div key={p.id} onClick={() => {handleProductSelect(index, p); setProductSearch('');}} className="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100">
                                      <div className="font-mono text-xs font-bold text-blue-600">{p.codigo}</div>
                                      <div className="text-xs font-medium truncate">{p.detalle}</div>
                                      <div className="text-[10px] text-gray-500 mt-1 flex gap-2">
                                        <span>Stock: <b className="text-gray-700">{p.stockDisp} {p.unidadPrincipal}</b></span>
                                        <span>Últ. Costo: <b className="text-gray-700">$\${p.costoDolar?.toFixed(2) || '0.00'}</b></span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-2 py-1.5 relative">
                              <input 
                                type="text" 
                                placeholder="Detalle (Busca aquí)" 
                                value={item.detalle}
                                onChange={e => {
                                  handlePurchaseItemChange(index, 'detalle', e.target.value);
                                  setProductSearch(e.target.value);
                                }}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs uppercase outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              {item.detalle.length > 2 && productSearch === item.detalle && !item.codigo && (
                                <div className="absolute top-full left-0 w-[400px] bg-white border border-gray-200 shadow-xl rounded-lg mt-1 z-50 max-h-48 overflow-y-auto custom-scrollbar">
                                  {inventory.filter(p => p.codigo.includes(item.detalle.toUpperCase()) || p.detalle.includes(item.detalle.toUpperCase())).slice(0, 15).map(p => (
                                    <div key={p.id} onClick={() => {handleProductSelect(index, p); setProductSearch('');}} className="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100">
                                      <div className="font-mono text-xs font-bold text-blue-600">{p.codigo}</div>
                                      <div className="text-xs font-medium truncate">{p.detalle}</div>
                                      <div className="text-[10px] text-gray-500 mt-1 flex gap-2">
                                        <span>Stock: <b className="text-gray-700">{p.stockDisp} {p.unidadPrincipal}</b></span>
                                        <span>Últ. Costo: <b className="text-gray-700">$\${p.costoDolar?.toFixed(2) || '0.00'}</b></span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-2 py-1.5">
                              <select 
                                value={item.esCaja ? 'true' : 'false'}
                                disabled={!item.codigo}
                                onChange={e => handlePurchaseItemChange(index, 'esCaja', e.target.value === 'true')}
                                className={\`w-full px-1 py-1 border border-gray-200 rounded text-[10px] font-bold outline-none \${!item.codigo ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600'}\`}
                              >
                                <option value="true">Prin.</option>
                                <option value="false">Sec.</option>
                              </select>
                            </td>`;

code = code.replace(oldRow, newRow);
fs.writeFileSync('src/pages/Compras.tsx', code);
