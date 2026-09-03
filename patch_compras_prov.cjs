const fs = require('fs');
let code = fs.readFileSync('src/pages/Compras.tsx', 'utf8');

// Add providerSearch state
code = code.replace(
  /const \[productSearch, setProductSearch\] = useState\(''\);/,
  "const [productSearch, setProductSearch] = useState('');\n  const [providerSearch, setProviderSearch] = useState('');"
);

// Replace provider input
const providerInputRegex = /<input \s*type="text" \s*required\s*value=\{editingPurchase\.proveedorNombre \|\| ''\} \s*onChange=\{e => setEditingPurchase\(\{...editingPurchase, proveedorNombre: e\.target\.value\}\)\}\s*className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-\[\#2563EB\]\/20 uppercase"\s*placeholder="Nombre del proveedor"\s*\/>/;

const newProviderInput = `<div className="relative">
                      <input 
                        type="text" 
                        required
                        value={editingPurchase.proveedorNombre || ''} 
                        onChange={e => {
                          setEditingPurchase({...editingPurchase, proveedorNombre: e.target.value});
                          setProviderSearch(e.target.value);
                        }}
                        onFocus={() => setProviderSearch(editingPurchase.proveedorNombre || '')}
                        onBlur={() => setTimeout(() => setProviderSearch(''), 200)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 uppercase"
                        placeholder="Nombre del proveedor"
                      />
                      {providerSearch && providerSearch.length > 0 && (
                        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 shadow-xl rounded-lg mt-1 z-50 max-h-48 overflow-y-auto custom-scrollbar">
                          {providers.filter(p => p.razonSocial.toLowerCase().includes(providerSearch.toLowerCase()) || p.rif.toLowerCase().includes(providerSearch.toLowerCase())).map(p => (
                            <div 
                              key={p.id} 
                              onClick={() => {
                                setEditingPurchase({
                                  ...editingPurchase, 
                                  proveedorNombre: p.razonSocial,
                                  condicionPago: p.credito ? 'Crédito' : 'Contado',
                                  diasCredito: p.diasCredito || 0
                                });
                                setProviderSearch('');
                              }} 
                              className="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 flex justify-between items-center"
                            >
                              <div>
                                <div className="font-bold text-sm text-[#0B1120]">{p.razonSocial}</div>
                                <div className="text-[10px] text-gray-500">{p.rif}</div>
                              </div>
                              <div className="text-[10px] font-bold px-2 py-1 bg-gray-100 rounded text-gray-600">
                                {p.credito ? \`Crédito (\${p.diasCredito} días)\` : 'Contado'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>`;

code = code.replace(providerInputRegex, newProviderInput);

fs.writeFileSync('src/pages/Compras.tsx', code);
