const fs = require('fs');
let code = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

const oldTasaHtml = `                    <div>
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
                    </div>`;

const newTasaHtml = `                    <div className={!userRole.permissions.ventas.editarTasa ? 'opacity-60 grayscale' : ''}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider truncate">
                          Tasa ({orderCurrency})
                        </label>
                        <div className="flex gap-2">
                          <label className={\`flex items-center gap-1 text-[9px] font-bold text-gray-500 \${userRole.permissions.ventas.editarTasa ? 'cursor-pointer' : 'cursor-not-allowed'}\`}>
                            <input 
                              type="radio" 
                              name="orderCurrency" 
                              value="BCV" 
                              checked={orderCurrency === 'BCV'} 
                              disabled={!userRole.permissions.ventas.editarTasa}
                              onChange={() => {
                                setOrderCurrency('BCV');
                                setOrderRate(Number((rates.bcv || 1).toFixed(2)));
                              }} 
                              className="w-2 h-2 accent-blue-600"
                            /> BCV
                          </label>
                          <label className={\`flex items-center gap-1 text-[9px] font-bold text-gray-500 \${userRole.permissions.ventas.editarTasa ? 'cursor-pointer' : 'cursor-not-allowed'}\`}>
                            <input 
                              type="radio" 
                              name="orderCurrency" 
                              value="EUR" 
                              checked={orderCurrency === 'EUR'}
                              disabled={!userRole.permissions.ventas.editarTasa} 
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
                          disabled={!userRole.permissions.ventas.editarTasa}
                          onChange={e => setOrderRate(Number(e.target.value))}
                          className={\`w-full pl-6 pr-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold transition-all \${userRole.permissions.ventas.editarTasa ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' : 'cursor-not-allowed text-gray-500'}\`}
                        />
                      </div>
                    </div>`;

code = code.replace(oldTasaHtml, newTasaHtml);
fs.writeFileSync('src/pages/Sales.tsx', code);
