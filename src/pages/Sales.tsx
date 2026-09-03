import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, FileEdit, Trash2, CheckCircle2, Truck, DollarSign, ArrowRight, ArrowLeft, X, User, Clock, ChevronDown, Tag, MapPin, CreditCard, TrendingUp, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { SaleStatus, SaleItem, Sale, Client, Product } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Autocomplete from '../components/Autocomplete';
import { useDocumentGenerator } from '../hooks/useDocumentGenerator';
import NewOrderModal from '../components/NewOrderModal';
import CloseSaleModal from '../components/CloseSaleModal';






const canPrintDocument = (sale: Sale) => {
  return sale.estado === 'Cerrado';
};



export default function Sales() {

  const { generateDocument } = useDocumentGenerator();
  const { sales, setSales, clients, receipts, setClients, inventory, setInventory, userRole, formatBs, activeRate, minoristaRate, useSeparateMinoristaRate, rates, calculateBs, companyConfig, sequencesConfig, setSequencesConfig } = useAppContext();
  const canEditPrice = userRole.permissions.ventas.editarPrecio;
  const [activeTab, setActiveTab] = useState<SaleStatus | 'Todos'>('Todos');
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [closingSale, setClosingSale] = useState<Sale | null>(null);
  const [closingData, setClosingData] = useState({ tasa: rates[activeRate.toLowerCase() as 'bcv' | 'eur'] || 0, amountToPay: '', paymentMethod: '', reference: '' });
  const [closingError, setClosingError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [searchParams] = useSearchParams();

  


  useEffect(() => {
    const pedidoId = searchParams.get('pedido');
    if (pedidoId && sales.length > 0) {
      const foundSale = sales.find(s => s.id === pedidoId);
      if (foundSale) {
        setSelectedSale(foundSale);

      }
    }
  }, [searchParams, sales]);

  // New Order Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [orderClient, setOrderClient] = useState<Partial<Client>>({});
  const [orderItems, setOrderItems] = useState<any[]>(Array(7).fill({}));
  const [tipoUbicacion, setTipoUbicacion] = useState<'Local' | 'Externo'>('Local');
  const [condicionPago, setCondicionPago] = useState<'Contado' | 'Crédito'>('Contado');
  const [tipoPrecio, setTipoPrecio] = useState<'Mayorista' | 'Minorista'>('Minorista');
  const [orderRate, setOrderRate] = useState<number>(1);
  const [orderCurrency, setOrderCurrency] = useState<'BCV' | 'EUR'>('BCV');

  useEffect(() => {
    if (!editingSaleId && isModalOpen) {
      const appliedRate = tipoPrecio === 'Minorista' ? minoristaRate : activeRate;
      setOrderCurrency(appliedRate as 'BCV' | 'EUR');
      const rateVal = rates[appliedRate.toLowerCase() as 'bcv' | 'eur'] || 1;
      setOrderRate(Number(rateVal.toFixed(2)));
    }
  }, [tipoPrecio, minoristaRate, activeRate, rates, editingSaleId, isModalOpen]);
  const [tipoDocumento, setTipoDocumento] = useState<'Nota de Despacho' | 'Factura'>('Nota de Despacho');

  

  const getDaysSince = (dateStr?: string) => {
    if (!dateStr) return '0 días';
    const past = new Date(dateStr);
    const today = new Date();
    past.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - past.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 0) return 'Hoy';
    return `Hace ${diffDays} días`;
  };

  const normalizeSearch = (str: string) => {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const filteredSales = useMemo(() => {
    let result = sales;
    if (activeTab !== 'Todos') {
      result = result.filter(s => s.estado === activeTab);
    }
    if (searchTerm) {
      const lowerSearch = normalizeSearch(searchTerm);
      result = result.filter(s => 
        normalizeSearch(s.id).includes(lowerSearch) || 
        normalizeSearch(s.clienteNombre).includes(lowerSearch) ||
        (s.numeroDocumento && normalizeSearch(s.numeroDocumento).includes(lowerSearch))
      );
    }
    return result;
  }, [sales, activeTab, searchTerm]);



  const getStatusColor = (status: SaleStatus) => {
    switch(status) {
      case 'Registrado/Cotizacion': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'Confirmado': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Entregado': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Cerrado': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default: return 'text-gray-500 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: SaleStatus) => {
    switch (status) {
      case 'Registrado/Cotizacion': return <FileEdit className="w-3 h-3" />;
      case 'Confirmado': return <Clock className="w-3 h-3" />;
      case 'Entregado': return <Truck className="w-3 h-3" />;
      case 'Cerrado': return <CheckCircle2 className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getNextStatusAction = (sale: Sale) => {
    if (sale.estado === 'Registrado/Cotizacion') return 'Confirmar Pedido';
    if (sale.estado === 'Confirmado' && sale.tipoPrecio === 'Minorista') return 'Cerrar Venta';
    if (sale.estado === 'Confirmado' && sale.tipoPrecio === 'Mayorista') return 'Entregar Venta';
    if (sale.estado === 'Entregado') return 'Cerrar Venta';
    return null;
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate logic
    if (field === 'codigo') {
      const invProduct = inventory.find(p => p.codigo === value);
      if (invProduct) {
        newItems[index].descripcion = invProduct.detalle;
        const isEmp = newItems[index].esEmpaque;
        const hasSecondary = invProduct.tienePrecioSecundario;
        const pPrincipal = tipoPrecio === 'Mayorista' ? (invProduct.precioMayor || 0) : (invProduct.precioMinorista || 0);
        const pSecondary = tipoPrecio === 'Mayorista' ? (invProduct.precioMayorSecundario || 0) : (invProduct.precioMinoristaSecundario || 0);
        let pFinal = pPrincipal;
        if (hasSecondary && !isEmp) pFinal = pSecondary;
        newItems[index].precioUnitario = pFinal;
        newItems[index].cantidad = 1;
        newItems[index].precio = pFinal;
        newItems[index].total = pFinal;
        newItems[index].unidadesPorEmpaque = invProduct.unidadesPorEmpaque || 1;
      }
    }

    if (field === 'cantidad' || field === 'precioUnitario' || field === 'esEmpaque') {
      if (field === 'esEmpaque' && newItems[index].codigo) {
        const invProduct = inventory.find(p => p.codigo === newItems[index].codigo);
        if (invProduct) {
           const isEmp = value;
           const hasSecondary = invProduct.tienePrecioSecundario;
           const pPrincipal = tipoPrecio === 'Mayorista' ? (invProduct.precioMayor || 0) : (invProduct.precioMinorista || 0);
           const pSecondary = tipoPrecio === 'Mayorista' ? (invProduct.precioMayorSecundario || 0) : (invProduct.precioMinoristaSecundario || 0);
           let pFinal = pPrincipal;
           if (hasSecondary && !isEmp) pFinal = pSecondary;
           newItems[index].precioUnitario = pFinal;
        }
      }
      const q = Number(newItems[index].cantidad) || 0;
      const p = Number(newItems[index].precioUnitario) || 0;
      newItems[index].precio = p;
      newItems[index].total = q * p;
    }

    setOrderItems(newItems);
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, {}]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const openNewOrder = () => {
    setEditingSaleId(null);
    setOrderClient({});
    setOrderItems(Array(7).fill({}));
    setTipoUbicacion('Local');
    setCondicionPago('Contado');
    setTipoPrecio('Minorista');
    setTipoDocumento('Nota de Despacho');
    setIsModalOpen(true);
  };

  const handleEditSale = (sale: Sale) => {
    setEditingSaleId(sale.id);
    setOrderClient({ rif: sale.clienteId, razonSocial: sale.clienteNombre });
    setOrderItems(sale.items);
    setTipoUbicacion(sale.tipoUbicacion);
    setCondicionPago(sale.condicionPago);
    setTipoPrecio(sale.tipoPrecio);
    setTipoDocumento(sale.tipoDocumento);
    setIsModalOpen(true);
  };

  const advanceStatus = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    if (sale.estado === 'Registrado/Cotizacion') {
      const hasZeroPrice = sale.items.some(i => i.precioUnitario <= 0);
      if (hasZeroPrice) {
        alert("Atención: Hay productos en la orden sin precio de venta asignado ($0). Debe establecer un precio antes de confirmar el pedido.");
        return;
    }
      }

    const action = getNextStatusAction(sale);
    if (action === 'Cerrar Venta' || action === 'Entregar Venta') {
      setClosingSale(sale);
      const appliedRate = (sale.tipoPrecio === 'Minorista') ? minoristaRate : activeRate;
      const defaultTasa = sale.tasaAplicada ? sale.tasaAplicada : Number((appliedRate === 'BCV' ? rates.bcv : rates.eur).toFixed(2));
      setClosingData({ tasa: defaultTasa, amountToPay: sale.total.toFixed(2), paymentMethod: companyConfig?.paymentMethods?.[0]?.name || '', reference: '' });
      setIsClosingModalOpen(true);
      return;
    }

    let finalUpdatedSale: Sale | null = null;
    
    setSales(prev => prev.map(s => {
      if (s.id === saleId) {
        let newStatus: SaleStatus = s.estado;
        
        if (s.estado === 'Registrado/Cotizacion') {
          newStatus = 'Confirmado';
          // Inventory: Increase stockComp, decrease stockDisp
          const updatedInventory = [...inventory];
          s.items.forEach(item => {
            const prodIndex = updatedInventory.findIndex(p => p.codigo === item.codigo);
            if (prodIndex >= 0) {
              const qtyToDeduct = item.esEmpaque ? item.cantidad : (item.cantidad / (item.unidadesPorEmpaque || 1));
              updatedInventory[prodIndex] = {
                ...updatedInventory[prodIndex],
                stockDisp: updatedInventory[prodIndex].stockDisp - qtyToDeduct,
                stockComp: (updatedInventory[prodIndex].stockComp || 0) + qtyToDeduct
              };
            }
          });
          setInventory(updatedInventory);
        } else if (s.estado === 'Confirmado') {
          newStatus = 'Entregado';
          // Inventory: Decrease stockComp
          const updatedInventory = [...inventory];
          s.items.forEach(item => {
            const prodIndex = updatedInventory.findIndex(p => p.codigo === item.codigo);
            if (prodIndex >= 0) {
              updatedInventory[prodIndex] = {
                ...updatedInventory[prodIndex],
                stockComp: Math.max(0, (updatedInventory[prodIndex].stockComp || 0) - item.cantidad)
              };
            }
          });
          setInventory(updatedInventory);
        }
        
        const updatedSale = { ...s, estado: newStatus, fechaEstado: new Date().toISOString() };
        finalUpdatedSale = updatedSale;
        if (selectedSale?.id === saleId) {
          setSelectedSale(updatedSale);
        }
        return updatedSale;
      }
      return s;
    }));
  };

  const handleDeleteSale = (saleId: string) => {
    const saleToDelete = sales.find(s => s.id === saleId);
    if (!saleToDelete) return;
    if (saleToDelete.estado === 'Cerrado') {
      alert("No se puede eliminar un pedido que ya ha sido cerrado/cobrado.");
      return;
    }
    if (window.confirm("¿Estás seguro de eliminar este pedido? El inventario será devuelto.")) {
      const updatedInventory = [...inventory];
      
      saleToDelete.items.forEach(item => {
        const prodIndex = updatedInventory.findIndex(p => p.codigo === item.codigo);
        if (prodIndex >= 0) {
          if (saleToDelete.estado === 'Confirmado') {
            updatedInventory[prodIndex] = {
              ...updatedInventory[prodIndex],
              stockDisp: updatedInventory[prodIndex].stockDisp + item.cantidad,
              stockComp: Math.max(0, (updatedInventory[prodIndex].stockComp || 0) - item.cantidad)
            };
          } else if (saleToDelete.estado === 'Entregado') { 
             updatedInventory[prodIndex] = {
              ...updatedInventory[prodIndex],
              stockDisp: updatedInventory[prodIndex].stockDisp + item.cantidad
            };
          }
        }
      });
      setInventory(updatedInventory);
      
      // Remove sale
      setSales(sales.filter(s => s.id !== saleId));
      if (selectedSale?.id === saleId) {
        setSelectedSale(null);
      }
    }
  };

  const handleSaveOrder = () => {
    const validItems = orderItems.filter(i => i.codigo && i.cantidad && i.precio);
    if (!orderClient.rif || validItems.length === 0) {
      alert("Por favor, ingrese cliente y al menos un producto.");
      return;
    }

    if (orderClient.rif) {
      const existingClient = clients.find(c => c.rif === orderClient.rif);
      if (!existingClient) {
        const newClient: Client = {
          id: `CL-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          tipoCliente: orderClient.tipoCliente || 'V',
          rif: orderClient.rif,
          razonSocial: orderClient.razonSocial || 'CLIENTE NUEVO',
          direccion: orderClient.direccion || '',
          telefono: orderClient.telefono || '',
          tipoPrecio: tipoPrecio,
          credito: condicionPago === 'Crédito',
          diasCredito: 0
        };
        setClients([newClient, ...clients]);
      }
    }

    if (editingSaleId) {
      const updatedSales = sales.map(s => {
        if (s.id === editingSaleId) {
          return {
            ...s,
            clienteId: orderClient.rif || '',
            clienteNombre: orderClient.razonSocial || 'CLIENTE NUEVO',
            tipoUbicacion,
            condicionPago,
            tipoPrecio,
            tipoDocumento,
            total: tipoDocumento === 'Factura' ? validItems.reduce((acc, i) => acc + (i.total || 0), 0) * (1 + (companyConfig.ivaVenta ?? 16) / 100) : validItems.reduce((acc, i) => acc + (i.total || 0), 0),
            items: validItems as SaleItem[],
            tasaAplicada: orderRate
          };
        }
        return s;
      });
      setSales(updatedSales);
      if (selectedSale?.id === editingSaleId) {
        setSelectedSale(updatedSales.find(s => s.id === editingSaleId) || null);
      }
    } else {
      const prefixPrecio = tipoPrecio === 'Mayorista' ? 'MA' : 'MI';
      const prefixPago = condicionPago === 'Contado' ? 'CO' : 'CR';
      const nextIdNumber = sequencesConfig.pedido || 1;
      const generatedId = `${prefixPrecio}${prefixPago}${nextIdNumber.toString().padStart(5, '0')}`;
      
      setSequencesConfig(prev => ({ ...prev, pedido: nextIdNumber + 1 }));

      const newSale: Sale = {
        id: generatedId,
        fecha: new Date().toISOString(),
        fechaEstado: new Date().toISOString(),
        auditLog: [{ date: new Date().toISOString(), action: 'Creado' }],
        clienteId: orderClient.rif || '',
        clienteNombre: orderClient.razonSocial || 'CLIENTE NUEVO',
        estado: 'Registrado/Cotizacion',
        tipoUbicacion,
        condicionPago,
        tipoDocumento,
        tipoPrecio,
        total: tipoDocumento === 'Factura' ? validItems.reduce((acc, i) => acc + (i.total || 0), 0) * (1 + (companyConfig.ivaVenta ?? 16) / 100) : validItems.reduce((acc, i) => acc + (i.total || 0), 0),
        items: validItems as SaleItem[],
        tasaAplicada: orderRate
      };
      setSales([newSale, ...sales]);
    }
    setIsModalOpen(false);
    setEditingSaleId(null);
  };

  const handleCloseSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingSale) return;
    const amountPaid = Number(closingData.amountToPay);
    if (isNaN(amountPaid) || amountPaid < 0) {
      setClosingError("Ingrese un monto válido a cobrar.");
      return;
    }
    if (closingSale.condicionPago === 'Contado') {
      if (Math.abs(amountPaid - closingSale.total) > 0.01) {
        setClosingError("En ventas de contado el monto a cobrar debe ser exacto al total de la venta en USD ($" + closingSale.total.toFixed(2) + ").");
        return;
      }
    } else {
      if (amountPaid > closingSale.total + 0.01) {
        setClosingError("El monto a cobrar no puede ser mayor al total de la venta.");
        return;
      }
    }
    
    let finalUpdatedSale: Sale | null = null;
    
    setSales(prev => prev.map(s => {
      if (s.id === closingSale.id) {
        // Handle inventory for Minorista that goes directly from Registrado/Cotizacion to Cerrado
        if (s.estado === 'Registrado/Cotizacion' && s.tipoPrecio === 'Minorista') {
          const updatedInventory = [...inventory];
          s.items.forEach(item => {
            const prodIndex = updatedInventory.findIndex(p => p.codigo === item.codigo);
            if (prodIndex >= 0) {
              const qtyToDeduct = item.esEmpaque ? item.cantidad : (item.cantidad / (item.unidadesPorEmpaque || 1));
              updatedInventory[prodIndex] = {
                ...updatedInventory[prodIndex],
                stockDisp: updatedInventory[prodIndex].stockDisp - qtyToDeduct
              };
            }
          });
          setInventory(updatedInventory);
        } else if (s.estado === 'Confirmado' && s.tipoPrecio === 'Mayorista') {
          const updatedInventory = [...inventory];
          s.items.forEach(item => {
            const prodIndex = updatedInventory.findIndex(p => p.codigo === item.codigo);
            if (prodIndex >= 0) {
              updatedInventory[prodIndex] = {
                ...updatedInventory[prodIndex],
                stockComp: Math.max(0, (updatedInventory[prodIndex].stockComp || 0) - item.cantidad)
              };
            }
          });
          setInventory(updatedInventory);
        }
        
        const targetStatus = closingSale.tipoPrecio === 'Mayorista' ? ('Entregado' as SaleStatus) : ('Cerrado' as SaleStatus);
        
        const updatedSale = {
           ...s,
           estado: targetStatus,
           montoPagado: amountPaid,
           tasaAplicada: closingData.tasa,
           fechaEstado: new Date().toISOString(),
           auditLog: [...(s.auditLog || []), { date: new Date().toISOString(), action: closingSale.tipoPrecio === 'Mayorista' ? 'Entregado y Cobrado' : 'Cerrado' }]
        };
        
        if (selectedSale?.id === s.id) {
          setSelectedSale(updatedSale);
        }
        finalUpdatedSale = updatedSale;
        return updatedSale;
      }
      return s;
    }));
    
    setIsClosingModalOpen(false);
    setClosingSale(null);
    alert(`Venta cerrada exitosamente. ${amountPaid < closingSale.total ? 'El saldo restante irá a Cuentas por Cobrar.' : 'Total pagado en su totalidad.'}`);
    if (finalUpdatedSale) {
      setTimeout(() => generateDocument(finalUpdatedSale!, selectedSale, setSelectedSale), 100);
    }
  };

  const modalState = {
    isModalOpen, setIsModalOpen, editingSaleId, setEditingSaleId,
    orderClient, setOrderClient, orderItems, setOrderItems,
    tipoUbicacion, setTipoUbicacion, condicionPago, setCondicionPago,
    tipoPrecio, setTipoPrecio, orderRate, setOrderRate, orderCurrency, setOrderCurrency,
    tipoDocumento, setTipoDocumento, handleSaveOrder, calculateBs, clients, inventory,
    minoristaRate, activeRate, rates, formatBs, handleItemChange, handleAddItem, handleRemoveItem, canEditPrice,
    isClosingModalOpen, setIsClosingModalOpen, closingSale, setClosingSale,
    closingData, setClosingData, closingError, setClosingError, handleCloseSaleSubmit,
    companyConfig
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">

      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-black text-[#0B1120] font-montserrat tracking-tight">Ventas y Pedidos</h1>
          <p className="text-[10px] text-gray-500 font-medium">Gestiona órdenes, despachos y cobranza.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={openNewOrder}
            className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20 font-montserrat uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> Nuevo Pedido
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main List */}
        <div className={`flex flex-col flex-1 border-r border-gray-200 ${selectedSale ? 'hidden lg:flex lg:max-w-md xl:max-w-lg' : 'flex'}`}>
          <div className="p-3 bg-white border-b border-gray-200 shrink-0">
            <div className="relative mb-3">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 opacity-40" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
                placeholder="Buscar pedido o cliente..."
              />
            </div>
            
            <div className="flex flex-wrap gap-1">
              {['Todos', 'Registrado/Cotizacion', 'Confirmado', 'Cerrado'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-colors border ${
                    activeTab === tab 
                      ? 'bg-[#0B1120] text-white border-[#0B1120]' 
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            <div className="flex flex-col gap-2">
              {filteredSales.length === 0 ? (
                <div className="text-center p-8 text-gray-400 text-sm font-medium">No hay pedidos que coincidan con la búsqueda.</div>
              ) : (
                filteredSales.map(sale => (
                  <div 
                    key={sale.id}
                    onClick={() => setSelectedSale(sale)}
                    className={`bg-white border rounded-xl p-3 cursor-pointer transition-all hover:shadow-md ${selectedSale?.id === sale.id ? 'border-[#2563EB] shadow-sm ring-1 ring-[#2563EB]/20' : 'border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-mono text-xs font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded">{sale.id}</div>
                      {sale.anulado && <div className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded ml-1">ANULADO</div>}
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getStatusColor(sale.estado)}`}>
                        {getStatusIcon(sale.estado)} {sale.estado}
                      </div>
                    </div>
                    <div className="font-black text-sm text-[#0B1120] leading-tight mb-1 truncate">{sale.clienteNombre}</div>
                    <div className="flex justify-between items-end mt-3">
                      <div className="flex flex-col gap-1.5">
                        <div className="text-[10px] text-gray-500 font-medium">{new Date(sale.fecha).toLocaleDateString()} &middot; {sale.items.length} items</div>
                        <div className="flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-50 w-fit px-1.5 py-0.5 rounded border border-amber-100">
                          <Clock className="w-3 h-3" />
                          <span>{getDaysSince(sale.fechaEstado || sale.fecha)} en este estado</span>
                        </div>
                      </div>
                      <div className="text-sm font-black text-[#10B981]">${sale.total.toFixed(2)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Detail View */}
        {selectedSale ? (
          <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden relative">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6">
              <button onClick={() => setSelectedSale(null)} className="lg:hidden mb-4 text-sm font-bold text-gray-500 hover:text-[#2563EB] flex items-center gap-1 transition-colors"><ArrowLeft className="w-4 h-4" /> Volver a Pedidos</button>
              
              <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h2 className="text-2xl font-black text-[#0B1120] font-mono">{selectedSale.id}</h2>
                    {selectedSale.numeroDocumento && (
                      <span className="text-sm font-bold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                        {selectedSale.tipoDocumento === 'Factura' ? 'Factura' : 'Nota'} #{selectedSale.numeroDocumento}
                      </span>
                    )}
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(selectedSale.estado)}`}>
                      {getStatusIcon(selectedSale.estado)} {selectedSale.estado}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-gray-600">{new Date(selectedSale.fecha).toLocaleString()}</div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {canPrintDocument(selectedSale) && (
                    <button 
                      onClick={() => generateDocument(selectedSale, selectedSale, setSelectedSale)}
                      className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-100"
                      title="Imprimir Documento"
                    >
                      <FileText className="w-3.5 h-3.5" /> {selectedSale.numeroDocumento ? 'Ver Documento' : 'Generar PDF'}
                    </button>
                  )}
                  {selectedSale.estado !== 'Cerrado' && (
                    <button 
                      onClick={() => handleDeleteSale(selectedSale.id)}
                      className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-red-100 transition-all border border-red-100"
                      title="Eliminar pedido y reversar inventario"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Eliminar
                    </button>
                  )}
                  {getNextStatusAction(selectedSale) && (
                    <button 
                      onClick={() => advanceStatus(selectedSale.id)}
                      className="bg-[#0B1120] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-sm"
                    >
                      {getNextStatusAction(selectedSale)} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              
              {selectedSale.anulado && <div className="bg-red-600 text-white font-black text-center py-2 px-4 rounded-xl mb-4 uppercase tracking-wider text-sm">ANULADO POR {selectedSale.anuladoPor?.toUpperCase()}</div>}

              {/* Unified Document Block */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col mb-6">
                 
                 {/* Top Section: Client condensed */}
                 <div className="p-4 border-b border-gray-100 flex justify-between items-start sm:items-center bg-gray-50/50 flex-col sm:flex-row gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-[#0B1120] uppercase tracking-wider">{selectedSale.clienteNombre}</h3>
                        {selectedSale.estado !== 'Cerrado' && (
                           <button onClick={() => handleEditSale(selectedSale)} className="p-1 hover:bg-gray-200 text-gray-500 rounded transition-colors" title="Editar Pedido">
                              <FileEdit className="w-3.5 h-3.5" />
                           </button>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 font-bold mt-0.5 uppercase tracking-wider">
                         RIF: {clients.find(c => c.id === selectedSale.clienteId)?.rif || selectedSale.clienteId} • {clients.find(c => c.id === selectedSale.clienteId)?.telefono || 'S/N'}
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-start sm:items-end gap-1">
                       <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase">{selectedSale.tipoPrecio}</span>
                       <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase">{selectedSale.condicionPago}</span>
                    </div>
                 </div>

                 {/* Articles Table */}
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] border-b border-gray-200 text-gray-500 uppercase font-bold text-[9px] tracking-wider">
                        <tr>
                          <th className="px-3 py-2">Código</th>
                          <th className="px-3 py-2">Descripción</th>
                          <th className="px-3 py-2 text-right">Cant.</th>
                          <th className="px-3 py-2 text-right">P. Unit</th>
                          <th className="px-3 py-2 text-right text-[#0B1120]">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedSale.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-2 font-mono font-bold text-[#2563EB]">{item.codigo}</td>
                            <td className="px-3 py-2 min-w-[200px]">
                              <div className="font-medium text-gray-800">{item.detalle}</div>
                              <div className="text-[9px] text-gray-400 mt-0.5">{item.marcaRepuesto} &middot; {item.marcaVehiculo}</div>
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-gray-600">{item.cantidad}</td>
                            <td className="px-3 py-2 text-right text-gray-600">${item.precio.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right font-black text-[#10B981]">${item.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>

                 {/* Totals Section */}
                 <div className="p-4 bg-gray-50/50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-end gap-6 shrink-0">
                    {selectedSale.tipoDocumento === 'Factura' && (
                      <div className="flex items-center justify-end gap-6">
                        <div className="flex flex-col text-right">
                          <span className="text-[9px] font-bold text-gray-500 uppercase">Subtotal</span>
                          <span className="text-sm font-bold text-gray-700">${(selectedSale.total / (1 + (companyConfig.ivaVenta ?? 16) / 100)).toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[9px] font-bold text-gray-500 uppercase">IVA ({companyConfig.ivaVenta ?? 16}%)</span>
                          <span className="text-sm font-bold text-gray-700">${(selectedSale.total - (selectedSale.total / (1 + (companyConfig.ivaVenta ?? 16) / 100))).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col text-right sm:pl-6 sm:border-l sm:border-gray-200 mt-2 sm:mt-0">
                      <span className="text-[9px] font-bold text-gray-500 uppercase">Total {selectedSale.tipoDocumento === 'Factura' ? '(con IVA)' : ''}</span>
                      <div className="flex items-baseline gap-2 justify-end">
                        <span className="text-2xl font-black text-[#10B981] leading-none">${selectedSale.total.toFixed(2)}</span>
                        <span className="text-[10px] font-bold text-gray-400">Bs. {(selectedSale.total * (selectedSale.tasaAplicada || 1)).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                 </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Auditoría</h4>
                <div className="space-y-1">
                  {selectedSale.auditLog?.map((log, idx) => (
                    <div key={idx} className="flex gap-4 text-[10px]">
                      <span className="text-gray-400 min-w-[120px] font-mono">{new Date(log.date).toLocaleString('es-VE')}</span>
                      <span className="text-gray-700 font-medium">{log.action}</span>
                    </div>
                  )) || <div className="text-[10px] text-gray-400 italic">No hay registros de auditoría</div>}
                </div>
              </div>
                                      </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm border border-gray-100 mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-black text-gray-400">Selecciona un pedido</h3>
              <p className="text-xs text-gray-400 mt-1">El detalle de la orden aparecerá aquí.</p>
            </div>
          </div>
        )}
      </div>

      {/* Nuevo Pedido Modal */}
      {isModalOpen && <NewOrderModal state={modalState} />}


      {/* Closing Modal */}
      {isClosingModalOpen && closingSale && <CloseSaleModal state={modalState} />}


    </div>
  );
}
