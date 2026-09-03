const fs = require('fs');
let code = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

const targetStr = fs.readFileSync('/tmp/target.tsx', 'utf8');

const replacementStr = `              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3 shrink-0">
                {/* Cliente Section */}
                <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col">
                  <h3 className="text-[11px] font-black text-[#0B1120] uppercase tracking-wider border-b border-gray-100 pb-1.5 mb-2.5">1. Datos del Cliente</h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-4 sm:col-span-1">
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">RIF / Cédula</label>
                      <div className="flex">
                        <select
                          value={orderClient.tipoCliente || 'V'}
                          onChange={e => setOrderClient({...orderClient, tipoCliente: e.target.value})}
                          className="px-1.5 py-1.5 bg-gray-50 border border-gray-200 rounded-l-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all border-r-0 font-bold"
                        >
                          <option value="V">V</option>
                          <option value="J">J</option>
                          <option value="E">E</option>
                          <option value="G">G</option>
                          <option value="P">P</option>
                          <option value="C">C</option>
                        </select>
                        <Autocomplete 
                          value={orderClient.rif || ''}
                          onChange={handleClientRifSearch}
                          onSelect={handleClientSelect}
                          options={clients.map(c => ({ label: c.rif, subLabel: c.razonSocial, data: c }))}
                          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-r-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-mono uppercase"
                          placeholder="Buscar..."
                        />
                      </div>
                    </div>
                    <div className="col-span-4 sm:col-span-3">
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Razón Social</label>
                      <input
                        type="text"
                        value={orderClient.razonSocial || ''}
                        onChange={e => setOrderClient({...orderClient, razonSocial: e.target.value})}
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all uppercase"
                        placeholder="Nombre del Cliente"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-1">
                       <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Teléfono</label>
                       <input
                        type="text"
                        value={orderClient.telefono || ''}
                        onChange={e => setOrderClient({...orderClient, telefono: e.target.value})}
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all uppercase"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-3">
                       <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Dirección</label>
                       <input
                        type="text"
                        value={orderClient.direccion || ''}
                        onChange={e => setOrderClient({...orderClient, direccion: e.target.value})}
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Parametros Section */}
                <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col">
                  <h3 className="text-[11px] font-black text-[#0B1120] uppercase tracking-wider border-b border-gray-100 pb-1.5 mb-2.5">2. Parámetros de Venta</h3>
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1 truncate">Tipo de Venta</label>
                      <div className="flex bg-gray-100 p-0.5 rounded-lg">
                        <button 
                          onClick={() => setTipoDocumento('Nota de Despacho')}
                          className={\`flex-1 py-1 text-[10px] font-bold rounded-md transition-all truncate px-1 \${tipoDocumento === 'Nota de Despacho' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}
                        >
                          Nota
                        </button>
                        <button 
                          onClick={() => setTipoDocumento('Factura')}
                          className={\`flex-1 py-1 text-[10px] font-bold rounded-md transition-all truncate px-1 \${tipoDocumento === 'Factura' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}
                        >
                          Factura
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1 truncate">Condición Pago</label>
                      <div className="flex bg-gray-100 p-0.5 rounded-lg">
                        <button 
                          onClick={() => setCondicionPago('Contado')}
                          className={\`flex-1 py-1 text-[10px] font-bold rounded-md transition-all truncate px-1 \${condicionPago === 'Contado' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}
                        >
                          Contado
                        </button>
                        <button 
                          onClick={() => setCondicionPago('Crédito')}
                          className={\`flex-1 py-1 text-[10px] font-bold rounded-md transition-all truncate px-1 \${condicionPago === 'Crédito' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}
                        >
                          Crédito
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1 truncate">Tipo Precio</label>
                      <div className="flex bg-gray-100 p-0.5 rounded-lg">
                        {userRole.permissions.ventas.verPrecioMinorista && (
                          <button 
                            onClick={() => setTipoPrecio('Minorista')}
                            className={\`flex-1 py-1 text-[10px] font-bold rounded-md transition-all truncate px-1 \${tipoPrecio === 'Minorista' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}
                          >
                            Minorista
                          </button>
                        )}
                        {userRole.permissions.ventas.verPrecioMayorista && (
                          <button 
                            onClick={() => setTipoPrecio('Mayorista')}
                            className={\`flex-1 py-1 text-[10px] font-bold rounded-md transition-all truncate px-1 \${tipoPrecio === 'Mayorista' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}
                          >
                            Mayorista
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider truncate">
                          Tasa ({orderCurrency})
                        </label>
                        <div className="flex gap-2">
                          <label className="flex items-center gap-1 text-[9px] font-bold text-gray-500 cursor-pointer">
                            <input 
                              type="radio" 
                              name="orderCurrency" 
                              value="BCV" 
                              checked={orderCurrency === 'BCV'} 
                              onChange={() => {
                                setOrderCurrency('BCV');
                                setOrderRate(Number((rates.bcv || 1).toFixed(2)));
                              }} 
                              className="w-2 h-2 accent-blue-600"
                            /> BCV
                          </label>
                          <label className="flex items-center gap-1 text-[9px] font-bold text-gray-500 cursor-pointer">
                            <input 
                              type="radio" 
                              name="orderCurrency" 
                              value="EUR" 
                              checked={orderCurrency === 'EUR'} 
                              onChange={() => {
                                setOrderCurrency('EUR');
                                setOrderRate(Number((rates.eur || 1).toFixed(2)));
                              }} 
                              className="w-2 h-2 accent-blue-600"
                            /> EUR
                          </label>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                          <TrendingUp className="w-3 h-3 text-gray-400" />
                        </div>
                        <input 
                          type="number" 
                          step="0.01"
                          value={orderRate} 
                          onChange={e => setOrderRate(Number(e.target.value))}
                          className="w-full pl-6 pr-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/pages/Sales.tsx', code);
  console.log("Successfully replaced target string.");
} else {
  console.log("Could not find target string.");
}
