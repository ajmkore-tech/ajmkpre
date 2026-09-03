const fs = require('fs');
let code = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

const oldToggle = `{userRole.permissions.ventas.verPrecioMinorista && (
                          <button 
                            onClick={() => handleTipoPrecioChange('Minorista')}
                            className={\`flex-1 py-1 text-[10px] font-bold rounded-md transition-all truncate px-1 \${tipoPrecio === 'Minorista' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}
                          >
                            Minorista
                          </button>
                        )}
                        {userRole.permissions.ventas.verPrecioMayorista && (
                          <button 
                            onClick={() => handleTipoPrecioChange('Mayorista')}
                            className={\`flex-1 py-1 text-[10px] font-bold rounded-md transition-all truncate px-1 \${tipoPrecio === 'Mayorista' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}
                          >
                            Mayorista
                          </button>
                        )}`;

const newToggle = `                          <button 
                            onClick={() => handleTipoPrecioChange('Minorista')}
                            disabled={!userRole.permissions.ventas.verPrecioMayorista}
                            className={\`flex-1 py-1 text-[10px] font-bold rounded-md transition-all truncate px-1 \${tipoPrecio === 'Minorista' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'} \${!userRole.permissions.ventas.verPrecioMayorista ? 'opacity-50 cursor-not-allowed' : ''}\`}
                          >
                            Minorista
                          </button>
                          <button 
                            onClick={() => handleTipoPrecioChange('Mayorista')}
                            disabled={!userRole.permissions.ventas.verPrecioMayorista}
                            className={\`flex-1 py-1 text-[10px] font-bold rounded-md transition-all truncate px-1 \${tipoPrecio === 'Mayorista' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'} \${!userRole.permissions.ventas.verPrecioMayorista ? 'opacity-50 cursor-not-allowed' : ''}\`}
                          >
                            Mayorista
                          </button>`;

code = code.replace(oldToggle, newToggle);

fs.writeFileSync('src/pages/Sales.tsx', code);
