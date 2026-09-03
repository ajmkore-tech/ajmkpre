const fs = require('fs');
let code = fs.readFileSync('src/pages/Compras.tsx', 'utf8');

// Fix initial state of purchaseItems
code = code.replace(
  /setPurchaseItems\(\[\{ codigo: '', detalle: '', cantidad: 1, recibido: 0, costoUnitario: 0, esCaja: false, unidadesPorCaja: 1 \}\]\);/,
  `setPurchaseItems(Array(7).fill(null).map(() => ({ codigo: '', detalle: '', cantidadPedida: 1, cantidadRecibida: 0, costoUnitario: 0, total: 0, esCaja: true, unidadesPorCaja: 1, costoAntiguo: 0, precioMinoristaActual: 0, precioMayoristaActual: 0, margenAnterior: 0, nuevoMargen: 0, nuevoPrecioMinorista: 0, nuevoPrecioMayorista: 0, aplicarNuevoPrecio: false })));`
);

// Fix "Agregar Línea" button
code = code.replace(
  /setPurchaseItems\(\[\.\.\.purchaseItems, \{ codigo: '', detalle: '', cantidad: 1, recibido: 0, costoUnitario: 0, esCaja: false, unidadesPorCaja: 1 \}\]\)/,
  `setPurchaseItems([...purchaseItems, { codigo: '', detalle: '', cantidadPedida: 1, cantidadRecibida: 0, costoUnitario: 0, total: 0, esCaja: true, unidadesPorCaja: 1, costoAntiguo: 0, precioMinoristaActual: 0, precioMayoristaActual: 0, margenAnterior: 0, nuevoMargen: 0, nuevoPrecioMinorista: 0, nuevoPrecioMayorista: 0, aplicarNuevoPrecio: false }])`
);

// Fix handleSavePurchase to save prices to inventory if applied
const savePurchaseMatch = /const newPurchase: Purchase = \{[\s\S]*?\} as Purchase;/;
const newSavePurchase = `const newPurchase: Purchase = {
      ...editingPurchase,
      items: validItems,
      total,
      fecha: editingPurchase.fecha || new Date().toISOString(),
      estado: editingPurchase.estado || 'Borrador'
    } as Purchase;
    
    let invUpdated = false;
    const newInv = [...inventory];
    validItems.forEach(item => {
      if (item.aplicarNuevoPrecio) {
        const prodIndex = newInv.findIndex(p => p.codigo === item.codigo);
        if (prodIndex >= 0) {
           newInv[prodIndex] = {
             ...newInv[prodIndex],
             precioDolar: item.nuevoPrecioMinorista || newInv[prodIndex].precioDolar,
             precioMayorista: item.nuevoPrecioMayorista || newInv[prodIndex].precioMayorista,
             costoDolar: item.costoUnitario,
             costoPromedio: item.costoUnitario // simplify for now since we are forcing a cost update when they explicitly apply a price
           };
           invUpdated = true;
        }
      }
    });
    
    if (invUpdated) {
       setInventory(newInv);
    }`;
code = code.replace(savePurchaseMatch, newSavePurchase);

// Let's create a custom function handleCostChange in the component
// Since we are doing a regex, we can insert it right after handleProductSelect
const productSelectCode = /const handleProductSelect = \([\s\S]*?setPurchaseItems\(newItems\);\n  \};/;

const newProductSelectAndCost = `const handleProductSelect = (index: number, prod: any) => {
    const newItems = [...purchaseItems];
    const costoAnterior = prod.costoPromedio || prod.costoDolar || 0;
    const pMin = prod.precioDolar || 0;
    const pMay = prod.precioMayorista || 0;
    
    let margenAnterior = 0;
    if (costoAnterior > 0) {
       margenAnterior = ((pMin - costoAnterior) / costoAnterior) * 100;
    }
    
    newItems[index] = {
      ...newItems[index],
      codigo: prod.codigo,
      detalle: prod.detalle,
      costoUnitario: costoAnterior,
      esCaja: true, // Default to primary as requested
      unidadesPorCaja: prod.unidadesPorEmpaque || 1,
      costoAntiguo: costoAnterior,
      precioMinoristaActual: pMin,
      precioMayoristaActual: pMay,
      margenAnterior: margenAnterior,
      nuevoMargen: margenAnterior,
      nuevoPrecioMinorista: pMin,
      nuevoPrecioMayorista: pMay,
      aplicarNuevoPrecio: false
    };
    setPurchaseItems(newItems);
  };
  
  const handleCostChange = (index: number, newCost: number) => {
    const newItems = [...purchaseItems];
    const item = newItems[index];
    item.costoUnitario = newCost;
    
    if (newCost > 0) {
      item.nuevoMargen = ((item.precioMinoristaActual - newCost) / newCost) * 100;
      item.nuevoPrecioMinorista = newCost * (1 + (item.margenAnterior / 100));
      
      const oldMayMargin = item.costoAntiguo > 0 ? ((item.precioMayoristaActual - item.costoAntiguo) / item.costoAntiguo) * 100 : 0;
      item.nuevoPrecioMayorista = newCost * (1 + (oldMayMargin / 100));
    } else {
      item.nuevoMargen = 0;
      item.nuevoPrecioMinorista = 0;
      item.nuevoPrecioMayorista = 0;
    }
    setPurchaseItems(newItems);
  };`;
  
code = code.replace(productSelectCode, newProductSelectAndCost);

// Now for the items UI. We need to replace the space-y-3 block containing the cards with a table
const itemsUiStart = `<div>
                  <h3 className="text-sm font-black text-[#0B1120] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Artículos</h3>`;
const itemsUiEnd = `<button 
                    type="button"
                    onClick={() => setPurchaseItems([...purchaseItems,`;
                    
const oldUiRegex = /<div className="space-y-3">\s*\{purchaseItems\.map\(\(item, index\) => \([\s\S]*?<\/button>\s*<\/div>\s*\)\)\}\s*<\/div>/;

const newTableUi = `<div className="overflow-x-auto custom-scrollbar border border-gray-200 rounded-xl bg-white shadow-sm">
                    <table className="w-full text-left text-xs min-w-[1200px]">
                      <thead className="bg-[#F8FAFC] border-b border-gray-200 text-gray-500 uppercase font-bold text-[9px] tracking-wider">
                        <tr>
                          <th className="px-2 py-2 w-32">Código</th>
                          <th className="px-2 py-2 min-w-[150px]">Detalle</th>
                          <th className="px-2 py-2 w-20">Unidad</th>
                          <th className="px-2 py-2 w-20 text-center">Cant.</th>
                          <th className="px-2 py-2 w-24 text-right">Costo Ant.</th>
                          <th className="px-2 py-2 w-28 text-right bg-blue-50/50">Costo Nuevo</th>
                          <th className="px-2 py-2 w-24 text-right">M. Ant(%)</th>
                          <th className="px-2 py-2 w-24 text-right">N. Marg(%)</th>
                          <th className="px-2 py-2 w-24 text-right">P. Act (Min)</th>
                          <th className="px-2 py-2 w-32 text-right bg-green-50/50">Nvo Precio Sug.</th>
                          <th className="px-2 py-2 w-10 text-center" title="Aplicar Nuevo Precio">✓</th>
                          <th className="px-2 py-2 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {purchaseItems.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-2 py-1.5 relative">
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
                                        <span>Últ. Costo: <b className="text-gray-700">$\${p.costoDolar?.toFixed(2) || '0.00'}</b></span>
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
                            </td>
                            <td className="px-2 py-1.5">
                              <input 
                                type="number" 
                                value={item.cantidadPedida || ''}
                                onChange={e => handlePurchaseItemChange(index, 'cantidadPedida', parseFloat(e.target.value)||0)}
                                className="w-full px-1 py-1 border border-gray-200 rounded text-xs font-bold text-center outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-2 py-1.5 text-right font-medium text-gray-500">
                              $\${(item.costoAntiguo || 0).toFixed(2)}
                            </td>
                            <td className="px-2 py-1.5 bg-blue-50/20">
                              <input 
                                type="number" 
                                step="0.01"
                                value={item.costoUnitario || ''}
                                onChange={e => handleCostChange(index, parseFloat(e.target.value)||0)}
                                className="w-full px-1 py-1 border border-gray-200 rounded text-xs text-right font-bold bg-white outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-2 py-1.5 text-right text-gray-500">
                              {(item.margenAnterior || 0).toFixed(1)}%
                            </td>
                            <td className="px-2 py-1.5 text-right font-bold text-gray-600">
                              {(item.nuevoMargen || 0).toFixed(1)}%
                            </td>
                            <td className="px-2 py-1.5 text-right text-gray-500">
                              $\${(item.precioMinoristaActual || 0).toFixed(2)}
                            </td>
                            <td className="px-2 py-1.5 bg-green-50/20">
                              <input 
                                type="number" 
                                step="0.01"
                                value={item.nuevoPrecioMinorista || ''}
                                onChange={e => handlePurchaseItemChange(index, 'nuevoPrecioMinorista', parseFloat(e.target.value)||0)}
                                className="w-full px-1 py-1 border border-gray-200 rounded text-xs text-right font-bold bg-white text-green-700 outline-none focus:ring-1 focus:ring-green-500"
                                title="Precio sugerido (modificable)"
                              />
                            </td>
                            <td className="px-2 py-1.5 text-center bg-gray-50">
                              <input 
                                type="checkbox"
                                checked={item.aplicarNuevoPrecio}
                                onChange={e => handlePurchaseItemChange(index, 'aplicarNuevoPrecio', e.target.checked)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                title="Actualizar inventario al guardar"
                              />
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <button 
                                type="button"
                                onClick={() => setPurchaseItems(purchaseItems.filter((_, i) => i !== index))}
                                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>`;
                  
code = code.replace(oldUiRegex, newTableUi);

fs.writeFileSync('src/pages/Compras.tsx', code);
