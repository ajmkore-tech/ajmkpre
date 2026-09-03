import React from 'react';
import { Search, Plus, FileEdit, Trash2, CheckCircle2, Truck, DollarSign, ArrowRight, ArrowLeft, X, User, Clock, ChevronDown, Tag, MapPin, CreditCard, TrendingUp, FileText } from 'lucide-react';
import Autocomplete from './Autocomplete';

export default function NewOrderModal({ state }: { state: any }) {
  const {
    isModalOpen, setIsModalOpen, editingSaleId, setEditingSaleId,
    orderClient, setOrderClient, orderItems, setOrderItems,
    tipoUbicacion, setTipoUbicacion, condicionPago, setCondicionPago,
    tipoPrecio, setTipoPrecio, orderRate, setOrderRate, orderCurrency, setOrderCurrency,
    tipoDocumento, setTipoDocumento, handleSaveOrder, calculateBs, clients, inventory,
    minoristaRate, activeRate, rates, formatBs, handleItemChange, handleAddItem, handleRemoveItem, canEditPrice, companyConfig
  } = state;

  return (
    
        <div className="fixed inset-0 bg-[#0B1120]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-[95vw] max-w-[1400px] overflow-hidden flex flex-col h-[96vh]">
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
              <div>
                <h2 className="text-lg font-black text-[#0B1120] font-montserrat tracking-tight">{editingSaleId ? `Editar Pedido - ${editingSaleId}` : "Nuevo Pedido"}</h2>
                <p className="text-xs text-gray-500 font-medium">{editingSaleId ? "Modifica los detalles del pedido." : "Crea una orden de venta para un cliente."}</p>
              </div>
              <button onClick={() => {setIsModalOpen(false); setEditingSaleId(null);}} className="p-2 text-gray-400 hover:bg-gray-200 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-[#F8FAFC] flex flex-col">
              
              {/* Cliente Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3 shrink-0">
                {/* Cliente Section */}
                <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col lg:col-span-2">
                  <h3 className="text-[11px] font-black text-[#0B1120] uppercase tracking-wider border-b border-gray-100 pb-1.5 mb-2.5">1. Datos del Cliente</h3>
                  <div className="grid grid-cols-6 gap-3">
                    <div className="col-span-6 sm:col-span-2">
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
                          onChange={state.handleClientRifSearch}
                          onSelect={state.handleClientSelect}
                          options={clients.map(c => ({ label: c.rif, subLabel: c.razonSocial, data: c }))}
                          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-r-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-mono uppercase"
                          placeholder="Buscar..."
                        />
                      </div>
                    </div>
                    <div className="col-span-6 sm:col-span-4">
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Razón Social</label>
                      <input
                        type="text"
                        value={orderClient.razonSocial || ''}
                        onChange={e => setOrderClient({...orderClient, razonSocial: e.target.value})}
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all uppercase"
                        placeholder="Nombre del Cliente"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-2">
                       <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Teléfono</label>
                       <input
                        type="text"
                        value={orderClient.telefono || ''}
                        onChange={e => setOrderClient({...orderClient, telefono: e.target.value})}
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all uppercase"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-2">
                       <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">Correo</label>
                       <input
                        type="email"
                        value={orderClient.correo || ''}
                        onChange={e => setOrderClient({...orderClient, correo: e.target.value})}
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
                        placeholder="ejemplo@correo.com"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-2">
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
                <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col lg:col-span-1">
                  <h3 className="text-[11px] font-black text-[#0B1120] uppercase tracking-wider border-b border-gray-100 pb-1.5 mb-2.5">2. Parámetros de Venta</h3>
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1 truncate">Tipo de Venta</label>
                      <div className="flex bg-gray-100 p-0.5 rounded-lg">
                        <button 
                          onClick={() => setTipoDocumento('Nota de Despacho')}
                          className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all truncate px-1 ${tipoDocumento === 'Nota de Despacho' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          Nota
                        </button>
                        <button 
                          onClick={() => setTipoDocumento('Factura')}
                          className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all truncate px-1 ${tipoDocumento === 'Factura' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
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
                          className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all truncate px-1 ${condicionPago === 'Contado' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          Contado
                        </button>
                        <button 
                          onClick={() => setCondicionPago('Crédito')}
                          className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all truncate px-1 ${condicionPago === 'Crédito' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          Crédito
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1 truncate">Tipo Precio</label>
                      <div className="flex bg-gray-100 p-0.5 rounded-lg">
                                                  <button 
                            onClick={() => state.handleTipoPrecioChange('Minorista')}
                            disabled={!state.userRole.permissions.ventas.verPrecioMayorista}
                            className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all truncate px-1 ${tipoPrecio === 'Minorista' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'} ${!state.userRole.permissions.ventas.verPrecioMayorista ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            Minorista
                          </button>
                          <button 
                            onClick={() => state.handleTipoPrecioChange('Mayorista')}
                            disabled={!state.userRole.permissions.ventas.verPrecioMayorista}
                            className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all truncate px-1 ${tipoPrecio === 'Mayorista' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'} ${!state.userRole.permissions.ventas.verPrecioMayorista ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            Mayorista
                          </button>
                      </div>
                    </div>
                    <div className={!state.userRole.permissions.ventas.editarTasa ? 'opacity-60 grayscale' : ''}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider truncate">
                          Tasa ({orderCurrency})
                        </label>
                        <div className="flex gap-2">
                          <label className={`flex items-center gap-1 text-[9px] font-bold text-gray-500 ${state.userRole.permissions.ventas.editarTasa ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                            <input 
                              type="radio" 
                              name="orderCurrency" 
                              value="BCV" 
                              checked={orderCurrency === 'BCV'} 
                              disabled={!state.userRole.permissions.ventas.editarTasa}
                              onChange={() => {
                                setOrderCurrency('BCV');
                                setOrderRate(Number((rates.bcv || 1).toFixed(2)));
                              }} 
                              className="w-2 h-2 accent-blue-600"
                            /> BCV
                          </label>
                          <label className={`flex items-center gap-1 text-[9px] font-bold text-gray-500 ${state.userRole.permissions.ventas.editarTasa ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                            <input 
                              type="radio" 
                              name="orderCurrency" 
                              value="EUR" 
                              checked={orderCurrency === 'EUR'}
                              disabled={!state.userRole.permissions.ventas.editarTasa} 
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
                          disabled={!state.userRole.permissions.ventas.editarTasa}
                          onChange={e => setOrderRate(Number(e.target.value))}
                          className={`w-full pl-6 pr-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold transition-all ${state.userRole.permissions.ventas.editarTasa ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' : 'cursor-not-allowed text-gray-500'}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Items Section */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[300px]">
                 <div className="p-3 border-b border-gray-100 flex justify-between items-center shrink-0">
                   <h3 className="text-sm font-black text-[#0B1120] uppercase tracking-wider">3. Artículos</h3>
                   <button 
                      onClick={() => setOrderItems([...orderItems, {}])}
                      className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                   >
                     <Plus className="w-3.5 h-3.5" /> Agregar Línea
                   </button>
                 </div>
                 <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] border-b border-gray-200 text-gray-500 uppercase font-bold text-[9px] tracking-wider">
                        <tr>
                          <th className="px-3 py-2 w-full min-w-[200px]">Producto (Buscar)</th>
                          <th className="px-3 py-2 text-right min-w-[140px] w-44">Cantidad</th>
                          <th className="px-3 py-2 text-right min-w-[120px] w-36">Precio Unit.</th>
                          <th className="px-3 py-2 text-right min-w-[120px] w-36 text-[#0B1120]">Total</th>
                          <th className="px-3 py-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orderItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-3 py-1.5">
                               <Autocomplete 
                                  value={item.codigo ? `${item.codigo} - ${item.detalle}` : ''}
                                  onChange={() => {}}
                                  onSelect={(data: any) => handleItemChange(idx, 'codigo', data.codigo)}
                                  options={inventory.map(p => ({ label: `${p.codigo} - ${p.detalle}`, subLabel: p.marcaRepuesto, data: p }))}
                                  className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-[#2563EB] transition-all"
                                  placeholder="Buscar producto..."
                                />
                            </td>
                            <td className="px-3 py-1.5">
                              <div className="flex flex-col gap-1 items-end">
                                <div className="flex w-full gap-1">
                                  <input 
                                    type="number" 
                                    value={item.cantidad === 0 ? 0 : (item.cantidad || '')} 
                                    onChange={e => handleItemChange(idx, 'cantidad', e.target.value)}
                                    className="w-1/2 text-right px-1.5 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:border-[#2563EB] transition-all font-bold text-gray-700" 
                                    min="0" 
                                    placeholder="0"
                                  />
                                  {item.unidadesPorEmpaque && item.unidadesPorEmpaque > 1 ? (
                                    <select 
                                      value={item.esEmpaque ? 'PRI' : 'SEC'} 
                                      onChange={e => handleItemChange(idx, 'esEmpaque', e.target.value === 'PRI')}
                                      className="w-1/2 text-[10px] px-1 py-1.5 border border-gray-200 rounded bg-white text-gray-700 font-bold focus:outline-none focus:border-[#2563EB]"
                                    >
                                      <option value="PRI">{item.unidad || 'CAJA'}</option>
                                      <option value="SEC">{item.empaqueBase || 'PIEZA'}</option>
                                    </select>
                                  ) : (
                                    <span className="w-1/2 text-[10px] px-1 py-1.5 flex items-center justify-center bg-gray-50 text-gray-400 border border-gray-200 rounded font-bold">{item.unidad || 'UND'}</span>
                                  )}
                                </div>
                                {item.codigo && (
                                  <div className="flex gap-2 text-[9px] font-medium leading-none whitespace-nowrap mt-1">
                                    <span className="text-gray-400">Disp: <span className="font-bold text-blue-600">
                                      {item.esEmpaque 
                                        ? Number((item.stockDisp || 0).toFixed(2))
                                        : Number(((item.stockDisp || 0) * (item.unidadesPorEmpaque || 1)).toFixed(2))}
                                    </span></span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-1.5 text-right">
                              <input 
                                type="number" 
                                value={item.precio || ''} 
                                onChange={e => handleItemChange(idx, 'precio', parseFloat(e.target.value))}
                                className={`w-full text-right px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-[#2563EB] transition-all ${!canEditPrice ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}`} 
                                min="0" step="0.01"
                                placeholder="0.00"
                                disabled={!canEditPrice}
                                title={!canEditPrice ? "No tienes permisos para editar el precio" : ""}
                              />
                              
                            </td>
                            <td className="px-3 py-1.5 text-right">
                              <div className="font-black text-[#10B981]">
                                ${(item.total || 0).toFixed(2)}
                              </div>
                              <div className="text-[10px] text-gray-500 font-bold mt-0.5">
                                Bs. {((item.total || 0) * (orderRate || 1)).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button 
                                onClick={() => setOrderItems(orderItems.filter((_, i) => i !== idx))}
                                className="text-red-400 hover:text-red-600 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
                 <div className="bg-[#F8FAFC] p-3 flex justify-between items-end border-t border-gray-100 shrink-0">
                    <div></div>
                    <div className="flex gap-6 items-end text-right">
                      {tipoDocumento === 'Factura' && (
                        <div className="flex flex-col border-r border-gray-200 pr-6 gap-1">
                          <div className="flex justify-between gap-4 text-xs font-bold text-gray-500">
                            <span>Subtotal:</span>
                            <span>${orderItems.reduce((acc, i) => acc + (i.total || 0), 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-xs font-bold text-gray-500">
                            <span>IVA ({companyConfig.ivaVenta ?? 16}%):</span>
                            <span>${(orderItems.reduce((acc, i) => acc + (i.total || 0), 0) * ((companyConfig.ivaVenta ?? 16) / 100)).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col items-end pl-2">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Total {tipoDocumento === 'Factura' ? '(con IVA)' : ''}</div>
                        <div className="text-xl font-black text-[#10B981] leading-none">
                          ${(tipoDocumento === 'Factura' ? orderItems.reduce((acc, i) => acc + (i.total || 0), 0) * (1 + (companyConfig.ivaVenta ?? 16) / 100) : orderItems.reduce((acc, i) => acc + (i.total || 0), 0)).toFixed(2)}
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 mt-0.5">Bs. {((tipoDocumento === 'Factura' ? orderItems.reduce((acc, i) => acc + (i.total || 0), 0) * (1 + (companyConfig.ivaVenta ?? 16) / 100) : orderItems.reduce((acc, i) => acc + (i.total || 0), 0)) * (orderRate || 1)).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                 </div>
              </div>

            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveOrder}
                className="bg-[#2563EB] text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20 font-montserrat uppercase tracking-wider"
              >
                Registrar Pedido
              </button>
            </div>
          </div>
        </div>
      
  );
}
