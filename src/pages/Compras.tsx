import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Filter, Package, DollarSign, Edit, Trash2, ArrowRight, X, FileText, CheckCircle2, Truck, ClipboardList, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Purchase, Expense, PurchaseItem, PurchaseStatus, Product } from '../types';

export default function Compras() {
  const { purchases, setPurchases, expenses, setExpenses, inventory, setInventory, providers, companyConfig, rates, activeRate } = useAppContext();
  const [activeTab, setActiveTab] = useState<'Productos' | 'Gastos'>('Productos');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isReceivingModalOpen, setIsReceivingModalOpen] = useState(false);

  // New Purchase state
  const [editingPurchase, setEditingPurchase] = useState<Partial<Purchase>>({ items: [] });
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [providerSearch, setProviderSearch] = useState('');

  // New Expense state
  const [editingExpense, setEditingExpense] = useState<Partial<Expense>>({});

  // Receive State
  const [receivingPurchase, setReceivingPurchase] = useState<Purchase | null>(null);
  const [receiveAmounts, setReceiveAmounts] = useState<{ [codigo: string]: number }>({});

  const filteredPurchases = purchases.filter(p => p.proveedorNombre.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase())).sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  const filteredExpenses = expenses.filter(e => (e.proveedorNombre || '').toLowerCase().includes(searchTerm.toLowerCase()) || e.id.toLowerCase().includes(searchTerm.toLowerCase())).sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  // ======== COMPRAS (PRODUCTOS) LOGIC ========
  const openNewPurchase = () => {
    setEditingPurchase({
      id: `OC-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Borrador',
      
      diasCredito: 0,
      total: 0,
      montoPagado: 0,
      pagos: []
    });
    setPurchaseItems(Array(7).fill(null).map(() => ({ codigo: '', detalle: '', cantidadPedida: 1, cantidadRecibida: 0, costoUnitario: 0, total: 0, esCaja: true, unidadesPorCaja: 1, costoAntiguo: 0, precioMinoristaActual: 0, precioMayoristaActual: 0, margenAnterior: 0, nuevoMargen: 0, nuevoPrecioMinorista: 0, nuevoPrecioMayorista: 0, aplicarNuevoPrecio: false })));
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseItemChange = (index: number, field: string, value: any) => {
    const newItems = [...purchaseItems];
    const item = newItems[index];
    
    if (field === 'esCaja') {
      const wasCaja = item.esCaja;
      const isCaja = value;
      item.esCaja = isCaja;
      const factor = item.unidadesPorCaja || 1;
      
      if (wasCaja !== isCaja && factor > 1) {
        if (!isCaja) {
          item.costoUnitario = item.costoUnitario / factor;
          item.costoAntiguo = item.costoAntiguo / factor;
          item.precioMinoristaActual = item.precioMinoristaActual / factor;
          item.precioMayoristaActual = item.precioMayoristaActual / factor;
          item.nuevoPrecioMinorista = item.nuevoPrecioMinorista / factor;
          item.nuevoPrecioMayorista = item.nuevoPrecioMayorista / factor;
        } else {
          item.costoUnitario = item.costoUnitario * factor;
          item.costoAntiguo = item.costoAntiguo * factor;
          item.precioMinoristaActual = item.precioMinoristaActual * factor;
          item.precioMayoristaActual = item.precioMayoristaActual * factor;
          item.nuevoPrecioMinorista = item.nuevoPrecioMinorista * factor;
          item.nuevoPrecioMayorista = item.nuevoPrecioMayorista * factor;
        }
        item.total = (item.cantidadPedida || 0) * (item.costoUnitario || 0);
      }
    } else {
      (item as any)[field] = value;
      if (field === 'cantidadPedida') {
          item.total = (value || 0) * (item.costoUnitario || 0);
      }
    }
    setPurchaseItems(newItems);
  };

  const handleProductSelect = (index: number, prod: any) => {
    const newItems = [...purchaseItems];
    const costoAnterior = prod.costoPromedio || prod.costoDolar || 0;
    const pMin = prod.precioMinor || 0;
    const pMay = prod.precioMayor || 0;
    
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
      unidad: prod.unidad || 'CAJA',
      empaqueBase: prod.empaqueBase || 'UND',
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
  
  const handleCostChange = (index: number, type: 'unit' | 'total', val: number) => {
    const newItems = [...purchaseItems];
    const item = newItems[index];
    
    let newCost = val;
    if (type === 'total') {
      item.total = val;
      if (item.cantidadPedida > 0) {
        newCost = val / item.cantidadPedida;
        item.costoUnitario = newCost;
      }
    } else {
      item.costoUnitario = val;
      item.total = val * (item.cantidadPedida || 0);
      newCost = val;
    }
    
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
  };
  



  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPurchase.proveedorNombre) return alert('Seleccione un proveedor');
    if (!editingPurchase.numeroFactura) return alert('El número de factura es obligatorio');
    
    // Filter out empty items
    const validItems = purchaseItems.filter(i => i.codigo && (i.cantidadPedida || 0) > 0 && i.costoUnitario > 0);
    if (validItems.length === 0) return alert('Debe incluir al menos un producto válido');

    const total = validItems.reduce((acc, item) => acc + (item.cantidadPedida * item.costoUnitario), 0);
    
    const newPurchase: Purchase = {
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
             precioMinor: item.nuevoPrecioMinorista || newInv[prodIndex].precioMinor,
             precioMayor: item.nuevoPrecioMayorista || newInv[prodIndex].precioMayor
           };
           invUpdated = true;
        }
      }
    });
    
    if (invUpdated) {
       setInventory(newInv);
    }

    setPurchases([newPurchase, ...purchases]);
    setIsPurchaseModalOpen(false);
  };

  const advancePurchaseStatus = (purchase: Purchase) => {
    if (purchase.estado === 'Borrador') {
      if (window.confirm("¿Confirmar esta compra y pasar a estado 'En Tránsito'? Se generará la Cuenta por Pagar si es a crédito.")) {
        const updated = { ...purchase, estado: 'En Tránsito' as PurchaseStatus };
        setPurchases(purchases.map(p => p.id === purchase.id ? updated : p));
      }
    } else if (purchase.estado === 'En Tránsito' || purchase.estado === 'Recibida Parcial') {
      setReceivingPurchase(purchase);
      const initialAmounts: any = {};
      purchase.items.forEach(item => {
        initialAmounts[item.codigo] = item.cantidadPedida - item.cantidadRecibida;
      });
      setReceiveAmounts(initialAmounts);
      setIsReceivingModalOpen(true);
    }
  };

  const handleReceiveConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivingPurchase) return;

    let allFullyReceived = true;
    let anyReceivedNow = false;
    const updatedItems = receivingPurchase.items.map(item => {
      const receivingNow = Number(receiveAmounts[item.codigo] || 0);
      if (receivingNow > 0) anyReceivedNow = true;
      const newRecibido = item.cantidadRecibida + receivingNow;
      if (newRecibido < item.cantidadPedida) allFullyReceived = false;
      return { ...item, recibido: newRecibido, receivingNow };
    });

    if (!anyReceivedNow) {
      alert("Debe recibir al menos una unidad para procesar.");
      return;
    }

    // Update Inventory Costs and Stock
    const invMap = new Map<string, Product>(inventory.map(p => [p.codigo, p]));
    updatedItems.forEach(item => {
      if (item.receivingNow > 0) {
        const prod = invMap.get(item.codigo);
        if (prod) {
          const totalUnitsReceived = item.esCaja ? item.receivingNow : (item.receivingNow / (item.unidadesPorCaja || 1));
          const costPerUnit = item.esCaja ? item.costoUnitario : (item.costoUnitario * (item.unidadesPorCaja || 1));
          
          const currentStock = prod.stockDisp || 0;
          const currentCost = prod.costoPromedio || prod.costoDolar || 0;
          
          // Weighted average cost formula
          const newAvgCost = currentStock + totalUnitsReceived > 0 
            ? ((currentStock * currentCost) + (totalUnitsReceived * costPerUnit)) / (currentStock + totalUnitsReceived)
            : costPerUnit;

          // Add to history
          const historyEntry = {
            id: Math.random().toString(36).substring(2, 9),
            fecha: new Date().toISOString(),
            costo: costPerUnit,
            proveedorNombre: receivingPurchase.proveedorNombre || 'Desconocido',
            referencia: receivingPurchase.numeroFactura || receivingPurchase.id
          };
          const newHistory = [historyEntry, ...(prod.historialCostos || [])].slice(0, 50); // Keep last 50

          invMap.set(item.codigo, {
            ...prod,
            stockDisp: currentStock + totalUnitsReceived,
            costoPromedio: newAvgCost,
            ultimoCosto: costPerUnit,
            costoDolar: costPerUnit, // Last cost backwards comp.
            historialCostos: newHistory
          });
        } else {
          // New product implicitly created
          invMap.set(item.codigo, {
            id: Math.random().toString(36).substr(2, 9),
            codigo: item.codigo,
            detalle: item.detalle,
            marcaRepuesto: 'N/A',
            marcaVehiculo: 'N/A',
            linea: 'N/A',
            tipoRepuesto: 'N/A',
            proveedor: receivingPurchase.proveedorNombre,
            stockDisp: item.esCaja ? item.receivingNow : (item.receivingNow / (item.unidadesPorCaja || 1)),
            costoPromedio: item.esCaja ? item.costoUnitario : (item.costoUnitario * (item.unidadesPorCaja || 1)),
            ultimoCosto: item.esCaja ? item.costoUnitario : (item.costoUnitario * (item.unidadesPorCaja || 1)),
            costoDolar: item.esCaja ? item.costoUnitario : (item.costoUnitario * (item.unidadesPorCaja || 1)),
            historialCostos: [{
              id: Math.random().toString(36).substring(2, 9),
              fecha: new Date().toISOString(),
              costo: item.esCaja ? item.costoUnitario : (item.costoUnitario * (item.unidadesPorCaja || 1)),
              proveedorNombre: receivingPurchase.proveedorNombre || 'Desconocido',
              referencia: receivingPurchase.numeroFactura || receivingPurchase.id
            }],
            precioMayor: 0,
            precioMinor: 0,
            empaqueBase: item.esCaja ? 'CAJA' : 'UND',
            unidadesPorEmpaque: item.esCaja ? item.unidadesPorCaja : 1
          });
        }
      }
    });

    setInventory(Array.from(invMap.values()));

    const newStatus = allFullyReceived ? 'Recibida Total' : 'Recibida Parcial';
    
    // Cleanup receivingNow flag
    const finalItems = updatedItems.map(i => {
      const { receivingNow, ...rest } = i;
      return rest;
    });

    setPurchases(purchases.map(p => p.id === receivingPurchase.id ? { ...p, items: finalItems, estado: newStatus } : p));
    setIsReceivingModalOpen(false);
    setReceivingPurchase(null);
    alert(`Mercancía recibida (${newStatus}). Inventario y costos actualizados.`);
  };

  // ======== GASTOS EXTRAS LOGIC ========
  const openNewExpense = () => {
    setEditingExpense({
      id: `GT-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
      fecha: new Date().toISOString().split('T')[0],
      categoria: companyConfig.expenseCategories?.[0]?.name || 'Operativos',
      descripcion: '',
      monto: 0,
      
      diasCredito: 0,
      estado: 'Por Pagar',
      montoPagado: 0,
      pagos: []
    });
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense.descripcion || !editingExpense.monto) return alert('Datos incompletos');
    
    const newExpense = { ...editingExpense } as Expense;
    if (newExpense.condicionPago === 'Contado') {
      newExpense.estado = 'Pagado';
      newExpense.montoPagado = newExpense.monto;
    }
    
    setExpenses([newExpense, ...expenses]);
    setIsExpenseModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Borrador': return 'bg-gray-100 text-gray-700';
      case 'En Tránsito': return 'bg-blue-100 text-blue-700';
      case 'Recibida Parcial': return 'bg-orange-100 text-orange-700';
      case 'Recibida Total': return 'bg-green-100 text-green-700';
      case 'Anulada': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-[#0B1120] font-montserrat tracking-tight">Compras y Gastos</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Reabastecimiento de inventario y control de gastos extras.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={openNewExpense} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-sm font-bold transition-all shadow-sm">
            + Registrar Gasto
          </button>
          <button onClick={openNewPurchase} className="px-4 py-2.5 bg-[#0B1120] hover:bg-gray-800 text-white rounded-xl text-sm font-bold transition-all shadow-sm">
            + Nueva Orden de Compra
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-8">
        <div className="bg-white flex-1 rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setActiveTab('Productos')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'Productos' ? 'bg-[#0B1120] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                Órdenes de Compra
              </button>
              <button 
                onClick={() => setActiveTab('Gastos')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'Gastos' ? 'bg-[#0B1120] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                Gastos Extras
              </button>
            </div>
            
            <div className="relative w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Buscar..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar p-4">
            {activeTab === 'Productos' ? (
              <div className="space-y-4">
                {filteredPurchases.length > 0 ? filteredPurchases.map(purchase => (
                  <div key={purchase.id} className="border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-4 flex flex-wrap gap-4 items-center justify-between border-b border-gray-100 bg-gray-50/30 rounded-t-xl">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono text-sm font-black text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded">{purchase.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusColor(purchase.estado)}`}>{purchase.estado}</span>
                        </div>
                        <h3 className="text-sm font-bold text-[#0B1120]">{purchase.proveedorNombre}</h3>
                        <div className="text-xs text-gray-500 font-medium">Factura: {purchase.numeroFactura || 'S/N'} • Condición: {purchase.condicionPago}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-[#0B1120]">${purchase.total.toFixed(2)}</div>
                        <div className="text-xs text-gray-500 font-medium">{purchase.items.length} ítems registrados</div>
                      </div>
                      <div className="flex flex-col gap-2 w-full sm:w-auto">
                        {purchase.estado !== 'Recibida Total' && purchase.estado !== 'Anulada' && (
                          <button 
                            onClick={() => advancePurchaseStatus(purchase)}
                            className="bg-[#0B1120] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                          >
                            {purchase.estado === 'Borrador' ? 'Confirmar Compra' : 'Recibir Mercancía'} <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-b-xl overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="text-gray-500 uppercase tracking-wider font-bold border-b border-gray-100">
                            <th className="pb-2">Código</th>
                            <th className="pb-2">Detalle</th>
                            <th className="pb-2 text-right">Cant. Pedida</th>
                            <th className="pb-2 text-right">Recibido</th>
                            <th className="pb-2 text-right">Costo U.</th>
                            <th className="pb-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {purchase.items.map((item, idx) => (
                            <tr key={idx} className="text-gray-700">
                              <td className="py-2 font-mono font-bold text-[#0B1120]">{item.codigo}</td>
                              <td className="py-2">{item.detalle} {item.esCaja ? '(Prin.)' : '(Sec.)'}</td>
                              <td className="py-2 text-right font-bold">{item.cantidadPedida} {item.esCaja ? 'CAJAS' : 'UND'}</td>
                              <td className="py-2 text-right font-bold text-blue-600">{item.cantidadRecibida}</td>
                              <td className="py-2 text-right font-medium">${item.costoUnitario.toFixed(2)}</td>
                              <td className="py-2 text-right font-bold">${(item.cantidadPedida * item.costoUnitario).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )) : (
                  <div className="text-center p-8 text-gray-500">No hay órdenes de compra registradas.</div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExpenses.length > 0 ? filteredExpenses.map(expense => (
                  <div key={expense.id} className="border border-gray-200 rounded-xl bg-white shadow-sm p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-sm font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{expense.id}</span>
                        <span className="text-xs font-bold text-gray-500">{new Date(expense.fecha).toLocaleDateString()}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-gray-100 text-gray-600">{expense.categoria}</span>
                      </div>
                      <h3 className="text-sm font-bold text-[#0B1120]">{expense.descripcion}</h3>
                      <div className="text-xs text-gray-500 font-medium">Proveedor: {expense.proveedorNombre || 'N/A'} • Condición: {expense.condicionPago}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-[#0B1120]">${expense.monto.toFixed(2)}</div>
                      <div className={`text-xs font-bold ${expense.estado === 'Pagado' ? 'text-green-600' : 'text-orange-600'}`}>{expense.estado}</div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center p-8 text-gray-500">No hay gastos extras registrados.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NEW PURCHASE MODAL */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-[98vw] shadow-2xl overflow-hidden flex flex-col h-[96vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <h2 className="text-lg font-black text-[#0B1120] font-montserrat tracking-tight">Nueva Orden de Compra</h2>
              <button onClick={() => setIsPurchaseModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSavePurchase} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                
                {/* Header Info */}
                <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="col-span-4 sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Proveedor</label>
                    <div className="relative">
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
                                {p.credito ? `Crédito (${p.diasCredito} días)` : 'Contado'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Condición</label>
                    <select 
                      value={editingPurchase.condicionPago || 'Contado'}
                      onChange={e => setEditingPurchase({...editingPurchase, condicionPago: e.target.value as any})}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                    >
                      <option value="Contado">Contado</option>
                      <option value="Crédito">Crédito</option>
                    </select>
                  </div>
                  {editingPurchase.condicionPago === 'Crédito' && (
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Días Crédito</label>
                      <input 
                        type="number" 
                        value={editingPurchase.diasCredito || 0} 
                        onChange={e => {
                          const dias = parseInt(e.target.value) || 0;
                          const date = new Date();
                          date.setDate(date.getDate() + dias);
                          setEditingPurchase({...editingPurchase, diasCredito: dias, fechaVencimiento: date.toISOString()});
                        }}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                      />
                    </div>
                  )}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Factura Prov. *</label>
                    <input 
                      type="text"
                      required
                      value={editingPurchase.numeroFactura || ''} 
                      onChange={e => setEditingPurchase({...editingPurchase, numeroFactura: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 uppercase font-mono"
                    />
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-sm font-black text-[#0B1120] uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Artículos</h3>
                  <div className="overflow-x-auto custom-scrollbar border border-gray-200 rounded-xl bg-white shadow-sm">
                    <table className="w-full text-left text-[10px] min-w-full">
                                            <thead className="bg-[#F8FAFC] border-b border-gray-200 text-gray-500 uppercase font-bold text-[9px] tracking-wider leading-tight">
                        <tr>
                          <th className="px-1 py-1 w-24">Código</th>
                          <th className="px-1 py-1 min-w-[120px]">Detalle</th>
                          <th className="px-1 py-1 w-16">Unidad</th>
                          <th className="px-1 py-1 w-14 text-center">Cant.</th>
                          <th className="px-1 py-1 w-20 text-right bg-blue-50/30">Cost.Total</th>
                          <th className="px-1 py-1 w-16 text-right bg-blue-50/50">Cost.Unit</th>
                          <th className="px-1 py-1 w-16 text-right text-gray-400">Cost.Ant</th>
                          <th className="px-1 py-1 w-16 text-right">Marg.Ant</th>
                          <th className="px-1 py-1 w-16 text-right">Marg.Nvo</th>
                          <th className="px-1 py-1 w-20 text-right">P.Act<br/><span className="text-[7px] text-gray-400">(MAY/MIN)</span></th>
                          <th className="px-1 py-1 w-20 text-right bg-green-50/50">P.Nvo<br/><span className="text-[7px] text-gray-400">(MAY/MIN)</span></th>
                          <th className="px-1 py-1 w-8 text-center" title="Aplicar Nuevo Precio">✓</th>
                          <th className="px-1 py-1 w-8 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {purchaseItems.map((item, index) => {
                          const mAntMay = item.costoAntiguo > 0 ? ((item.precioMayoristaActual - item.costoAntiguo)/item.costoAntiguo)*100 : 0;
                          const mAntMin = item.costoAntiguo > 0 ? ((item.precioMinoristaActual - item.costoAntiguo)/item.costoAntiguo)*100 : 0;
                          
                          const mNvoMay = item.costoUnitario > 0 ? ((item.nuevoPrecioMayorista - item.costoUnitario)/item.costoUnitario)*100 : 0;
                          const mNvoMin = item.costoUnitario > 0 ? ((item.nuevoPrecioMinorista - item.costoUnitario)/item.costoUnitario)*100 : 0;

                          const diffMay = mNvoMay - mAntMay;
                          const diffMin = mNvoMin - mAntMin;
                          
                          return (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-1 py-1 relative">
                              <input 
                                type="text" 
                                placeholder="Buscar..." 
                                value={item.codigo}
                                onChange={e => {
                                  handlePurchaseItemChange(index, 'codigo', e.target.value);
                                  setProductSearch(e.target.value);
                                }}
                                onFocus={() => setProductSearch(item.codigo)}
                                onBlur={() => setTimeout(() => setProductSearch(''), 200)}
                                className="w-full px-1 py-1 border border-gray-200 rounded text-[10px] uppercase outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              {item.codigo.length > 2 && productSearch === item.codigo && (
                                <div className="absolute top-full left-0 w-96 bg-white border border-gray-200 shadow-xl rounded-lg mt-1 z-50 max-h-48 overflow-y-auto custom-scrollbar">
                                  {inventory.filter(p => p.codigo.toUpperCase().includes((item.codigo || '').toUpperCase()) || p.detalle.toUpperCase().includes((item.codigo || '').toUpperCase())).slice(0, 10).map(p => (
                                    <div key={p.id} onClick={() => {handleProductSelect(index, p); setProductSearch('');}} className="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100">
                                      <div className="font-mono text-[10px] font-bold text-blue-600">{p.codigo}</div>
                                      <div className="text-[10px] font-medium truncate">{p.detalle}</div>
                                      <div className="text-[9px] text-gray-500 mt-1 flex gap-2">
                                        <span>Stock: <b className="text-gray-700">{p.stockDisp}</b></span>
                                        <span>Últ. Costo: <b className="text-gray-700">${p.costoDolar?.toFixed(2) || '0.00'}</b></span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-1 py-1 relative">
                              <input 
                                type="text" 
                                placeholder="Detalle (Buscar)" 
                                value={item.detalle}
                                onChange={e => {
                                  handlePurchaseItemChange(index, 'detalle', e.target.value);
                                  setProductSearch(e.target.value);
                                }}
                                onFocus={() => setProductSearch(item.detalle)}
                                onBlur={() => setTimeout(() => setProductSearch(''), 200)}
                                className="w-full px-1 py-1 border border-gray-200 rounded text-[10px] uppercase outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              {item.detalle.length > 2 && productSearch === item.detalle && !item.codigo && (
                                <div className="absolute top-full left-0 w-96 bg-white border border-gray-200 shadow-xl rounded-lg mt-1 z-50 max-h-48 overflow-y-auto custom-scrollbar">
                                  {inventory.filter(p => p.codigo.toUpperCase().includes((item.detalle || '').toUpperCase()) || p.detalle.toUpperCase().includes((item.detalle || '').toUpperCase())).slice(0, 10).map(p => (
                                    <div key={p.id} onClick={() => {handleProductSelect(index, p); setProductSearch('');}} className="p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100">
                                      <div className="font-mono text-[10px] font-bold text-blue-600">{p.codigo}</div>
                                      <div className="text-[10px] font-medium truncate">{p.detalle}</div>
                                      <div className="text-[9px] text-gray-500 mt-1 flex gap-2">
                                        <span>Stock: <b className="text-gray-700">{p.stockDisp}</b></span>
                                        <span>Últ. Costo: <b className="text-gray-700">${p.costoDolar?.toFixed(2) || '0.00'}</b></span>
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
                                className={`w-full px-0.5 py-1 border border-gray-200 rounded text-[9px] font-bold outline-none ${!item.codigo ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600'}`}
                              >
                                <option value="true">{item.unidad || 'CAJA'}</option>
                                <option value="false">{item.empaqueBase || 'UND'}</option>
                              </select>
                            </td>
                            <td className="px-1 py-1">
                              <input 
                                type="number" 
                                value={item.cantidadPedida || ''}
                                onChange={e => handlePurchaseItemChange(index, 'cantidadPedida', parseFloat(e.target.value)||0)}
                                className="w-full px-1 py-1 border border-gray-200 rounded text-[10px] font-bold text-center outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-1 py-1 bg-blue-50/30">
                              <input 
                                type="number" 
                                step="0.01"
                                value={item.total || ''}
                                onChange={e => handleCostChange(index, 'total', parseFloat(e.target.value)||0)}
                                className="w-full px-1 py-1 border border-gray-200 rounded text-[10px] text-right font-bold bg-white outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-1 py-1 bg-blue-50/50">
                              <input 
                                type="number" 
                                step="0.01"
                                value={item.costoUnitario || ''}
                                onChange={e => handleCostChange(index, 'unit', parseFloat(e.target.value)||0)}
                                className="w-full px-1 py-1 border border-gray-200 rounded text-[10px] text-right font-bold bg-white outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-1 py-1 text-right font-medium text-gray-400">
                              ${(item.costoAntiguo || 0).toFixed(2)}
                            </td>
                            <td className="px-1 py-1 text-right text-gray-500 leading-tight">
                              <div className="text-[9px]">M: {mAntMay.toFixed(1)}%</div>
                              <div className="text-[9px]">m: {mAntMin.toFixed(1)}%</div>
                            </td>
                            <td className="px-1 py-1 text-right font-bold leading-tight">
                              <div className={`text-[9px] flex justify-end gap-1 items-center ${mNvoMay < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                <span>M: {mNvoMay.toFixed(1)}%</span>
                                {Math.abs(diffMay) > 0.1 && (
                                  <span className={`text-[7px] flex items-center ${diffMay > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {diffMay > 0 ? '↑' : '↓'}{Math.abs(diffMay).toFixed(1)}%
                                  </span>
                                )}
                              </div>
                              <div className={`text-[9px] flex justify-end gap-1 items-center ${mNvoMin < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                <span>m: {mNvoMin.toFixed(1)}%</span>
                                {Math.abs(diffMin) > 0.1 && (
                                  <span className={`text-[7px] flex items-center ${diffMin > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {diffMin > 0 ? '↑' : '↓'}{Math.abs(diffMin).toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-1 py-1 text-right text-gray-500 leading-tight">
                              <div className="text-[9px] font-bold text-gray-600">${(item.precioMayoristaActual || 0).toFixed(2)}</div>
                              <div className="text-[9px]">${(item.precioMinoristaActual || 0).toFixed(2)}</div>
                            </td>
                            <td className="px-1 py-1 bg-green-50/20 flex flex-col gap-1 items-end">
                              <input 
                                type="number" 
                                step="0.01"
                                value={item.nuevoPrecioMayorista || ''}
                                onChange={e => handlePurchaseItemChange(index, 'nuevoPrecioMayorista', parseFloat(e.target.value)||0)}
                                className="w-16 px-1 py-0.5 border border-gray-200 rounded text-[9px] text-right font-bold bg-white text-green-700 outline-none focus:ring-1 focus:ring-green-500"
                                title="Nuevo Precio Mayorista"
                              />
                              <input 
                                type="number" 
                                step="0.01"
                                value={item.nuevoPrecioMinorista || ''}
                                onChange={e => handlePurchaseItemChange(index, 'nuevoPrecioMinorista', parseFloat(e.target.value)||0)}
                                className="w-16 px-1 py-0.5 border border-gray-200 rounded text-[9px] text-right font-bold bg-white text-green-700 outline-none focus:ring-1 focus:ring-green-500"
                                title="Nuevo Precio Minorista"
                              />
                            </td>
                            <td className="px-1 py-1 text-center bg-gray-50">
                              <input 
                                type="checkbox"
                                checked={item.aplicarNuevoPrecio}
                                onChange={e => handlePurchaseItemChange(index, 'aplicarNuevoPrecio', e.target.checked)}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                title="Actualizar inventario al guardar"
                              />
                            </td>
                            <td className="px-1 py-1 text-center">
                              <button 
                                type="button"
                                onClick={() => setPurchaseItems(purchaseItems.filter((_, i) => i !== index))}
                                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                              </button>
                            </td>
                          </tr>
                        );
                        })}
                      </tbody>

                    </table>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setPurchaseItems([...purchaseItems, { codigo: '', detalle: '', cantidadPedida: 1, cantidadRecibida: 0, costoUnitario: 0, total: 0, esCaja: true, unidadesPorCaja: 1, costoAntiguo: 0, precioMinoristaActual: 0, precioMayoristaActual: 0, margenAnterior: 0, nuevoMargen: 0, nuevoPrecioMinorista: 0, nuevoPrecioMayorista: 0, aplicarNuevoPrecio: false }])}
                    className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Agregar Línea
                  </button>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                <div className="text-2xl font-black text-[#0B1120]">
                  Total: ${purchaseItems.reduce((acc, item) => acc + ((item.cantidadPedida||0) * (item.costoUnitario||0)), 0).toFixed(2)}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsPurchaseModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0B1120] hover:bg-gray-800 transition-colors shadow-lg shadow-black/10">
                    Guardar Borrador
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW EXPENSE MODAL */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <h2 className="text-lg font-black text-[#0B1120] font-montserrat tracking-tight">Registrar Gasto Extra</h2>
              <button onClick={() => setIsExpenseModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSaveExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Categoría</label>
                <select 
                  value={editingExpense.categoria}
                  onChange={e => setEditingExpense({...editingExpense, categoria: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                >
                  {companyConfig.expenseCategories?.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Descripción</label>
                <input 
                  type="text" 
                  required
                  value={editingExpense.descripcion} 
                  onChange={e => setEditingExpense({...editingExpense, descripcion: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 uppercase"
                  placeholder="Ej. Pago de Alquiler Agosto"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Monto (USD)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={editingExpense.monto || ''} 
                    onChange={e => setEditingExpense({...editingExpense, monto: parseFloat(e.target.value)||0})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-lg font-black text-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Condición</label>
                  <select 
                    value={editingExpense.condicionPago}
                    onChange={e => setEditingExpense({...editingExpense, condicionPago: e.target.value as any})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  >
                    <option value="Contado">Contado</option>
                    <option value="Crédito">Crédito (CxP)</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0B1120] hover:bg-gray-800 transition-colors uppercase tracking-wider">
                  Registrar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIVE MODAL */}
      {isReceivingModalOpen && receivingPurchase && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <h2 className="text-lg font-black text-[#0B1120] font-montserrat tracking-tight">Recibir Mercancía - {receivingPurchase.id}</h2>
              <button onClick={() => setIsReceivingModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleReceiveConfirm} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                <div className="bg-orange-50 text-orange-800 p-4 rounded-xl text-sm font-medium border border-orange-100 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>Indica la cantidad que estás recibiendo físicamente en este momento. Al confirmar, <b>el inventario y los costos promedios se actualizarán automáticamente.</b></p>
                </div>
                
                <table className="w-full text-left border-collapse mt-4">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-bold">
                      <th className="px-4 py-3 rounded-tl-xl">Código / Detalle</th>
                      <th className="px-4 py-3 text-right">Pedida</th>
                      <th className="px-4 py-3 text-right">Ya Recibida</th>
                      <th className="px-4 py-3 text-right text-blue-600 rounded-tr-xl">Recibiendo Hoy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {receivingPurchase.items.map(item => (
                      <tr key={item.codigo} className="text-sm hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-[#0B1120]">{item.codigo}</div>
                          <div className="text-gray-500">{item.detalle}</div>
                          {item.esCaja && <div className="text-[10px] bg-gray-200 inline-block px-1.5 rounded font-bold mt-1">CAJA DE {item.unidadesPorCaja}</div>}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-600">{item.cantidadPedida}</td>
                        <td className="px-4 py-3 text-right font-bold text-green-600">{item.cantidadRecibida}</td>
                        <td className="px-4 py-3 text-right">
                          <input 
                            type="number"
                            min="0"
                            max={item.cantidadPedida - item.cantidadRecibida}
                            value={receiveAmounts[item.codigo] === undefined ? '' : receiveAmounts[item.codigo]}
                            onChange={e => setReceiveAmounts({...receiveAmounts, [item.codigo]: parseInt(e.target.value) || 0})}
                            className="w-24 px-3 py-1.5 border border-blue-200 rounded-lg bg-blue-50 focus:bg-white text-right font-black text-blue-700 outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsReceivingModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0B1120] hover:bg-gray-800 transition-colors">
                  Confirmar Recepción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
