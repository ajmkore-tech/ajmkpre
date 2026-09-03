const fs = require('fs');
let code = fs.readFileSync('src/pages/Compras.tsx', 'utf8');

// Shrink the table and table headers
code = code.replace(
  /table className="w-full text-left text-xs min-w-\[1200px\]"/,
  'table className="w-full text-left text-[10px] min-w-full"'
);

// Reduce padding on th
code = code.replaceAll('th className="px-2 py-2', 'th className="px-1 py-1.5');

// Update TR elements
code = code.replaceAll('td className="px-2 py-1.5', 'td className="px-1 py-1');

// Implement the Detalle searchable dropdown AND proper esCaja disabled state
const blockToReplace = `<td className="px-1 py-1">
                              <input 
                                type="text" 
                                placeholder="Detalle" 
                                value={item.detalle}
                                onChange={e => handlePurchaseItemChange(index, 'detalle', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs uppercase outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-1 py-1">
                              <select 
                                value={item.esCaja ? 'true' : 'false'}
                                onChange={e => handlePurchaseItemChange(index, 'esCaja', e.target.value === 'true')}
                                className="w-full px-1 py-1 border border-gray-200 rounded text-xs bg-white outline-none"
                              >
                                <option value="true">Prin.</option>
                                <option value="false">Sec.</option>
                              </select>
                            </td>`;

const newBlock = `<td className="px-1 py-1 relative">
                              <input 
                                type="text" 
                                placeholder="Detalle (Buscar)" 
                                value={item.detalle}
                                onChange={e => {
                                  handlePurchaseItemChange(index, 'detalle', e.target.value);
                                  setProductSearch(e.target.value);
                                }}
                                className="w-full px-1 py-1 border border-gray-200 rounded text-[10px] uppercase outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              {item.detalle.length > 2 && productSearch === item.detalle && !item.codigo && (
                                <div className="absolute top-full left-0 w-96 bg-white border border-gray-200 shadow-xl rounded-lg mt-1 z-50 max-h-48 overflow-y-auto custom-scrollbar">
                                  {inventory.filter(p => p.codigo.includes(item.detalle.toUpperCase()) || p.detalle.includes(item.detalle.toUpperCase())).slice(0, 10).map(p => (
                                    <div key={p.id} onClick={() => {handleProductSelect(index, p); setProductSearch('');}} className="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100">
                                      <div className="font-mono text-[10px] font-bold text-blue-600">{p.codigo}</div>
                                      <div className="text-[10px] font-medium truncate">{p.detalle}</div>
                                      <div className="text-[9px] text-gray-500 mt-1 flex gap-2">
                                        <span>Stock: <b className="text-gray-700">{p.stockDisp} {p.unidadPrincipal}</b></span>
                                        <span>Últ. Costo: <b className="text-gray-700">\${p.costoDolar?.toFixed(2) || '0.00'}</b></span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-1 py-1">
                              <select 
                                value={item.esCaja ? 'true' : 'false'}
                                disabled={!item.codigo}
                                onChange={e => handlePurchaseItemChange(index, 'esCaja', e.target.value === 'true')}
                                className={\`w-full px-0.5 py-1 border border-gray-200 rounded text-[9px] font-bold outline-none \${!item.codigo ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600'}\`}
                              >
                                <option value="true">Prin.</option>
                                <option value="false">Sec.</option>
                              </select>
                            </td>`;

code = code.replace(blockToReplace, newBlock);

// Shrink inner inputs text sizes
code = code.replaceAll('text-xs uppercase font-mono', 'text-[10px] uppercase font-mono');
code = code.replaceAll('text-xs font-bold text-center', 'text-[10px] font-bold text-center');
code = code.replaceAll('text-xs text-right font-bold', 'text-[10px] text-right font-bold');
code = code.replaceAll('text-xs uppercase outline-none', 'text-[10px] uppercase outline-none');
code = code.replaceAll('px-2 py-1 border', 'px-1 py-1 border');


fs.writeFileSync('src/pages/Compras.tsx', code);
