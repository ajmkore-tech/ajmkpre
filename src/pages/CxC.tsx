import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, DollarSign, Calendar, Clock, CreditCard, ChevronDown, CheckCircle2, User, X, FileText, ArrowRight, History, ArrowLeft, Truck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Sale, Client, SaleStatus } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function CxC() {
  const { sales, setSales, clients, formatBs, activeRate, companyConfig, sequencesConfig, setSequencesConfig, receipts, setReceipts } = useAppContext();
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pendientes' | 'movimientos'>('pendientes');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAbonoModalOpen, setIsAbonoModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  
  // Abono Modal State
  const [paymentTotal, setPaymentTotal] = useState<number | ''>('');
  const [abonoAllocations, setAbonoAllocations] = useState<Record<string, number>>({});
  const [printReceipt, setPrintReceipt] = useState(false);

  // CxC Logic
  // A client has debt if they have orders with 'Recibido/Pendiente de pago' or potentially others that are Crédito but not Cobrado
  const pendingOrders = sales.filter(s => (s.estado === 'Cerrado' || s.estado === 'Entregado') && (s.total - (s.montoPagado || 0)) > 0.01);
  
  const clientsWithDebtIds = Array.from(new Set(pendingOrders.map(o => o.clienteId)));
  const clientsWithDebt = clients.filter(c => clientsWithDebtIds.includes(c.id) || clientsWithDebtIds.includes(c.rif));

  const dashboardData = clientsWithDebt.map(client => {
    const clientPendingOrders = pendingOrders.filter(o => o.clienteId === client.id || o.clienteId === client.rif);
    const debt = clientPendingOrders.reduce((acc, order) => acc + (order.total - (order.montoPagado || 0)), 0);
    return {
      ...client,
      totalDebt: debt,
      orderCount: clientPendingOrders.length
    };
  }).sort((a, b) => b.totalDebt - a.totalDebt);
  
  const totalGlobalDebt = dashboardData.reduce((acc, client) => acc + client.totalDebt, 0);


  const selectedClientOrders = pendingOrders.filter(o => 
    selectedClientId && (o.clienteId === selectedClientId || o.clienteId === clients.find(c => c.id === selectedClientId)?.rif)
  );

  const allClientOrders = sales.filter(o => 
    selectedClientId && (o.clienteId === selectedClientId || o.clienteId === clients.find(c => c.id === selectedClientId)?.rif)
  );

  const totalDebt = selectedClientOrders.reduce((acc, order) => acc + (order.total - (order.montoPagado || 0)), 0);

  // For this mock, the maximum delay is just a simulation or calculated from fecha
  const getDaysDelayed = (dateStr: string) => {
    const orderDate = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - orderDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };
  
  const maxDelay = selectedClientOrders.length > 0 ? Math.max(...selectedClientOrders.map(o => getDaysDelayed(o.fecha))) : 0;

  const movimientos = [];
  allClientOrders.forEach(order => {
    movimientos.push({
      id: `${order.id}-cargo`,
      fecha: order.fecha,
      pedidoId: order.id,
      articulo: `Cargo por pedido (${order.items.length} arts)`,
      cargo: order.total,
      abono: 0
    });
    
    if (order.montoPagado && order.montoPagado > 0) {
      movimientos.push({
        id: `${order.id}-abono`,
        // Default to order date if we don't track payment date
        fecha: order.fechaEstado || order.fecha,
        pedidoId: order.id,
        articulo: `Abono parcial/total al pedido`,
        cargo: 0,
        abono: order.montoPagado
      });
    }
  });

  movimientos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  let runningBalance = 0;
  const movimientosConSaldo = movimientos.map(m => {
    runningBalance += m.cargo;
    runningBalance -= m.abono;
    return { ...m, saldo: runningBalance };
  });

  movimientosConSaldo.reverse();





  const generateReceiptPDF = (sequenceNumber: number, paymentAmount: number, assignedOrders: {id: string, amount: number, total: number, remaining: number}[], client: Client | undefined) => {
    const doc = new jsPDF();
    const companyName = companyConfig?.nombre || 'Empresa';
    const companyRif = companyConfig?.rif || 'J-00000000';
    
    // Header
    // Logo
    if (companyConfig?.logo) {
      doc.addImage(companyConfig.logo, 'PNG', 14, 10, 25, 25, '', 'FAST');
    }
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(companyName, 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`RIF: ${companyRif}`, 105, 26, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`RECIBO DE COBRO N° ${sequenceNumber.toString().padStart(6, '0')}`, 105, 36, { align: 'center' });
    
    // Client Info
    doc.setFontSize(10);
    doc.text(`Fecha de Emisión:`, 14, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString(), 45, 50);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Cliente:`, 14, 56);
    doc.setFont('helvetica', 'normal');
    doc.text(client?.razonSocial || '', 30, 56);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`RIF:`, 14, 62);
    doc.setFont('helvetica', 'normal');
    doc.text(client?.rif || '', 24, 62);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Dirección:`, 14, 68);
    doc.setFont('helvetica', 'normal');
    doc.text(client?.direccion || 'N/A', 35, 68);
    
    // Table
    const tableData = assignedOrders.map(o => {
      const sale = sales.find(s => s.id === o.id);
      const fecha = sale ? new Date(sale.fecha).toLocaleDateString() : '';
      const docType = sale ? sale.tipoDocumento || 'Nota de Despacho' : '';
      return [
        o.id,
        fecha,
        docType,
        `${o.total.toFixed(2)}`,
        `${o.amount.toFixed(2)}`,
        `${o.remaining.toFixed(2)}`
      ];
    });

    autoTable(doc, {
      startY: 75,
      head: [['Pedido', 'Fecha', 'Documento', 'Monto Total', 'Abono Aplicado', 'Saldo Pendiente']],
      body: tableData,
      theme: 'plain',
      styles: { fontSize: 9, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.1, halign: 'right' },
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center' },
        2: { halign: 'left' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 75;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL RECIBIDO USD:`, 110, finalY + 15);
    doc.text(`${paymentAmount.toFixed(2)}`, 170, finalY + 15);

    // Footer Text
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('¡Gracias por su pago! Este recibo es comprobante de la transacción.', 105, finalY + 30, { align: 'center' });

    // Firma
    if (companyConfig?.firma) {
      doc.addImage(companyConfig.firma, 'PNG', 14, finalY + 40, 40, 20, '', 'FAST');
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Firma Autorizada', 14, finalY + 65);

    return doc;
  };

  const handleReprintReceipt = (receipt: any) => {
    const client = clients.find(c => c.id === receipt.clienteId || c.rif === receipt.clienteId);
    const doc = generateReceiptPDF(parseInt(receipt.id), receipt.montoTotal, receipt.asignaciones, client);
    doc.save(`Recibo_Cobro_${receipt.id}.pdf`);
  };

  const handlePrintReceipt = (paymentAmount: number, assignedOrders: {id: string, amount: number, total: number, remaining: number}[]) => {
    const sequenceNumber = sequencesConfig.secuencia1 ?? 1;
    const client = clients.find(c => c.id === selectedClientId || c.rif === selectedClientId);
    
    const doc = generateReceiptPDF(sequenceNumber, paymentAmount, assignedOrders, client);
    doc.save(`Recibo_Cobro_${sequenceNumber.toString().padStart(6, '0')}.pdf`);
  };


  const getStatusColor = (status: SaleStatus) => {
    switch (status) {
      case 'Registrado/Cotizacion': return 'text-gray-600 border-gray-200 bg-gray-50';
      case 'Confirmado': return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'Entregado': return 'text-purple-600 border-purple-200 bg-purple-50';
      case 'Cerrado': return 'text-green-600 border-green-200 bg-green-50';
      default: return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };
const getStatusIcon = (status: SaleStatus) => {
    switch (status) {
      case 'Registrado/Cotizacion': return <FileText className="w-3 h-3" />;
      case 'Confirmado': return <CheckCircle2 className="w-3 h-3" />;
      case 'Entregado': return <Truck className="w-3 h-3" />;
      case 'Cerrado': return <DollarSign className="w-3 h-3" />;
      default: return null;
    }
  };

  const getTotalDistribuido = () => {
    let total = 0;
    for (const key in abonoAllocations) {
      total += (abonoAllocations[key] || 0);
    }
    return total;
  };


  const handleAbonoSubmit = (e: React.FormEvent) => {

    e.preventDefault();
    if (!paymentTotal || Number(paymentTotal) <= 0) return;

    const subtotalAllocated = getTotalDistribuido();
    
    // Allow slight float precision differences, but generally must match exactly
    if (Math.abs(Number(paymentTotal) - subtotalAllocated) > 0.01) {
      alert(`Error: El monto total a pagar (${Number(paymentTotal).toFixed(2)}) no coincide con el total distribuido en la grilla (${subtotalAllocated.toFixed(2)}).`);
      return;
    }


    const assignedOrders: {id: string, amount: number, total: number, remaining: number}[] = [];

    setSales(prev => prev.map(s => {
      const allocation = abonoAllocations[s.id];
      if (allocation && allocation > 0) {
        const currentPagado = s.montoPagado || 0;
        const newPagado = currentPagado + allocation;
        const remaining = s.total - newPagado;
        
        assignedOrders.push({ id: s.id, amount: allocation, total: s.total, remaining: remaining });
        
        let newStatus = s.estado;
        
        return { 
          ...s, 
          montoPagado: newPagado, 
          estado: newStatus, 
          fechaEstado: new Date().toISOString() 
        };
      }
      return s;
    }));


    const sequenceNumber = sequencesConfig.secuencia1 ?? 1;
    const client = clients.find(c => c.id === selectedClientId || c.rif === selectedClientId);
    
    const newReceipt = {
      id: sequenceNumber.toString(),
      fecha: new Date().toISOString(),
      clienteId: client?.id || '',
      clienteNombre: client?.razonSocial || 'Desconocido',
      clienteRif: client?.rif || '',
      montoTotal: Number(paymentTotal),
      asignaciones: assignedOrders
    };

    setReceipts(prev => [newReceipt, ...prev]);
    setSequencesConfig(prev => ({...prev, secuencia1: prev.secuencia1 + 1}));

    if (printReceipt) {
      const doc = generateReceiptPDF(sequenceNumber, Number(paymentTotal), assignedOrders, client);
      doc.save(`Recibo_Cobro_${sequenceNumber.toString().padStart(6, '0')}.pdf`);
    } else {
      alert("Pago registrado correctamente.");
    }

    setIsAbonoModalOpen(false);
    setPaymentTotal('');
    setAbonoAllocations({});
    setPrintReceipt(false);

  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-black text-[#0B1120] font-montserrat tracking-tight">Cuentas por Cobrar (CxC)</h1>
          <p className="text-xs text-gray-500 mt-0.5">Gestión de créditos y cobranzas</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => setIsAbonoModalOpen(true)}
             disabled={!selectedClientId || selectedClientOrders.length === 0}
             className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <CreditCard className="w-4 h-4" /> Registrar Pago / Abono
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className={`flex-1 overflow-auto p-6 custom-scrollbar ${selectedSale ? 'hidden lg:block lg:max-w-md xl:max-w-lg border-r border-gray-200' : 'block'}`}>
          <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Top Filter */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Seleccionar Cliente</label>
              <div className="relative">
                <select 
                  value={selectedClientId} 
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all appearance-none font-medium"
                >
                  <option value="">-- Seleccione un cliente con deuda --</option>
                  {clientsWithDebt.map(client => (
                    <option key={client.id} value={client.id}>{client.razonSocial} ({client.rif})</option>
                  ))}
                </select>
                <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            {selectedClientId && (
              <div className="flex gap-4 w-full md:w-auto">
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg min-w-[150px]">
                  <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Saldo Total</div>
                  <div className="text-xl font-black text-blue-700">${totalDebt.toFixed(2)}</div>
                  <div className="text-[10px] text-blue-500 font-medium">{formatBs(totalDebt)}</div>
                </div>
                <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg min-w-[120px]">
                  <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">Días de Mora</div>
                  <div className="text-xl font-black text-orange-700">{maxDelay} días</div>
                </div>
              </div>
            )}
          </div>

          {/* Tabs and Grid of Orders */}
          {selectedClientId ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="flex border-b border-gray-100 bg-gray-50/50">
                <button 
                  onClick={() => setActiveTab('pendientes')}
                  className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'pendientes' ? 'border-[#2563EB] text-[#2563EB] bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                >
                  <DollarSign className="w-4 h-4" /> Deuda Pendiente
                </button>
                <button 
                  onClick={() => setActiveTab('movimientos')}
                  className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'movimientos' ? 'border-[#2563EB] text-[#2563EB] bg-blue-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                >
                  <History className="w-4 h-4" /> Movimientos
                </button>
              </div>
              
              {activeTab === 'pendientes' ? (
                <div>
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h2 className="text-sm font-bold text-[#0B1120]">Cargos y Abonos (Pedidos Pendientes)</h2>
                  </div>
                  
                  {selectedClientOrders.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {selectedClientOrders.map(order => (
                        <div key={order.id} onClick={() => setSelectedSale(order)} className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="bg-orange-100 text-orange-600 p-3 rounded-lg">
                              <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-sm text-[#0B1120]">{order.id}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 uppercase tracking-wider border border-orange-200">
                                  {order.estado}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" /> {new Date(order.fecha).toLocaleDateString()}
                                <span className="text-gray-300">•</span>
                                <span className="text-orange-500 font-medium">{getDaysDelayed(order.fecha)} días transcurridos</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-black text-[#0B1120]">${(order.total - (order.montoPagado || 0)).toFixed(2)}</div>
                            <div className="text-xs text-gray-500 font-medium">{formatBs(order.total - (order.montoPagado || 0))}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                      <div className="text-gray-500 font-medium">Este cliente no tiene deudas pendientes.</div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h2 className="text-sm font-bold text-[#0B1120]">Historial de Movimientos</h2>
                  </div>
                  
                  {movimientosConSaldo.length > 0 ? (
                    <div className="overflow-auto">
                      <table className="w-full text-left border-collapse min-w-max">
                        <thead className="bg-[#0B1120] text-white text-[10px] uppercase tracking-wider font-montserrat">
                          <tr>
                            <th className="px-4 py-3 font-bold">Fecha</th>
                            <th className="px-4 py-3 font-bold">Pedido</th>
                            <th className="px-4 py-3 font-bold">Artículo / Concepto</th>
                            <th className="px-4 py-3 font-bold text-right">Cargo</th>
                            <th className="px-4 py-3 font-bold text-right">Abono</th>
                            <th className="px-4 py-3 font-bold text-right">Saldo</th>
                            <th className="px-4 py-3 font-bold text-center">Recibo</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs text-[#0F172A] divide-y divide-gray-100">
                          {movimientosConSaldo.map((mov) => (
                            <tr key={mov.id} onClick={() => { const sale = sales.find(s => s.id === mov.pedidoId); if (sale) setSelectedSale(sale); }} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                              <td className="px-4 py-3 text-gray-500">{new Date(mov.fecha).toLocaleDateString()}</td>
                              <td className="px-4 py-3 font-bold text-[#2563EB]">{mov.pedidoId}</td>
                              <td className="px-4 py-3 text-gray-600 font-medium">{mov.articulo}</td>
                              <td className="px-4 py-3 text-right font-bold text-[#0B1120]">
                                {mov.cargo > 0 ? `${mov.cargo.toFixed(2)}` : '-'}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-green-600">
                                {mov.abono > 0 ? `${mov.abono.toFixed(2)}` : '-'}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-orange-600">
                                `${mov.saldo.toFixed(2)}`
                              </td>
                              <td className="px-4 py-3 text-center">
                                {mov.abono > 0 && receipts.find(r => r.asignaciones.some(a => a.id === mov.pedidoId)) && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const receipt = receipts.find(r => r.asignaciones.some(a => a.id === mov.pedidoId));
                                      if (receipt) handleReprintReceipt(receipt);
                                    }}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Ver Recibo"
                                  >
                                    <FileText className="w-4 h-4 mx-auto" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                      <div className="text-gray-500 font-medium">Este cliente no tiene historial de movimientos.</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Global Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                   <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total por Cobrar</h3>
                   <div className="text-3xl font-black text-blue-700">${totalGlobalDebt.toFixed(2)}</div>
                   <div className="text-sm font-bold text-gray-400 mt-1">{formatBs(totalGlobalDebt)}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                   <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Clientes con Deuda</h3>
                   <div className="text-3xl font-black text-[#0B1120]">{dashboardData.length}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                   <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Pedidos Pendientes</h3>
                   <div className="text-3xl font-black text-orange-600">{pendingOrders.length}</div>
                </div>
              </div>

              {/* Clients Grid */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-base font-bold text-[#0B1120] font-montserrat">Directorio de Deudores</h3>
                </div>
                {dashboardData.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {dashboardData.map(client => (
                      <div 
                        key={client.id} 
                        onClick={() => setSelectedClientId(client.id)}
                        className="p-5 flex items-center justify-between hover:bg-blue-50/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                             {client.razonSocial.charAt(0)}
                           </div>
                           <div>
                             <div className="font-black text-[#0B1120] text-sm">{client.razonSocial}</div>
                             <div className="text-xs text-gray-500 mt-0.5">{client.rif} • {client.orderCount} pedido(s) pendiente(s)</div>
                           </div>
                        </div>
                        <div className="text-right flex items-center gap-6">
                          <div>
                            <div className="text-lg font-black text-orange-600">${client.totalDebt.toFixed(2)}</div>
                            <div className="text-xs font-bold text-gray-400">{formatBs(client.totalDebt)}</div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                   <div className="p-12 text-center">
                      <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                      <div className="text-lg font-bold text-[#0B1120] mb-2">¡Todo al día!</div>
                      <div className="text-gray-500 font-medium">No hay cuentas por cobrar en este momento.</div>
                   </div>
                )}
              </div>
            </div>
          )}

          </div>
        </div>
        
        {selectedSale && (
          <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden relative">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6">
              <div className="flex justify-between items-center mb-4">
                  <button onClick={() => setSelectedSale(null)} className="lg:hidden text-sm font-bold text-gray-500 hover:text-[#2563EB] flex items-center gap-1 transition-colors"><ArrowLeft className="w-4 h-4" /> Volver</button>
                  <button onClick={() => setSelectedSale(null)} className="hidden lg:flex p-1 hover:bg-gray-200 text-gray-500 rounded transition-colors ml-auto" title="Cerrar detalle">
                    <X className="w-5 h-5" />
                  </button>
              </div>
              
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
              </div>
              
              {selectedSale.anulado && <div className="bg-red-600 text-white font-black text-center py-2 px-4 rounded-xl mb-4 uppercase tracking-wider text-sm">ANULADO POR {selectedSale.anuladoPor?.toUpperCase()}</div>}

              {/* Unified Document Block */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col mb-6">
                 
                 {/* Top Section: Client condensed */}
                 <div className="p-4 border-b border-gray-100 flex justify-between items-start sm:items-center bg-gray-50/50 flex-col sm:flex-row gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-[#0B1120] uppercase tracking-wider">{selectedSale.clienteNombre}</h3>
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
        )}
      </div>

      {/* Abono Modal */}
      {isAbonoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-black text-[#0B1120] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#2563EB]" />
                Registrar Pago
              </h2>
              <button onClick={() => setIsAbonoModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAbonoSubmit} className="flex-1 overflow-y-auto flex flex-col">
              <div className="p-6 space-y-6">
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Monto Total del Pago (USD)</label>
                  <div className="relative max-w-sm">
                    <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0.01"
                      required
                      value={paymentTotal}
                      onChange={(e) => setPaymentTotal(e.target.value ? Number(e.target.value) : '')}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-lg font-bold bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700">Documentos Pendientes</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50/50 border-b border-gray-100 text-xs text-gray-500 font-bold uppercase">
                        <tr>
                          <th className="px-4 py-3">Pedido</th>
                          <th className="px-4 py-3">Fecha</th>
                          <th className="px-4 py-3 text-right">Total</th>
                          <th className="px-4 py-3 text-right">Abonado</th>
                          <th className="px-4 py-3 text-right">Saldo</th>
                          <th className="px-4 py-3 text-right w-40">Abonar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedClientOrders.map(order => {
                          const pagado = order.montoPagado || 0;
                          const saldo = order.total - pagado;
                          return (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 font-medium text-gray-900">{order.id}</td>
                              <td className="px-4 py-3 text-gray-500">{new Date(order.fecha).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-right font-medium text-gray-900">${order.total.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right text-gray-500">${pagado.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right font-bold text-orange-600">${saldo.toFixed(2)}</td>
                              <td className="px-4 py-3">
                                <input 
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  max={saldo}
                                  value={abonoAllocations[order.id] || ''}
                                  onChange={(e) => setAbonoAllocations(prev => ({...prev, [order.id]: Number(e.target.value)}))}
                                  className="w-full p-2 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-500 outline-none"
                                  placeholder="0.00"
                                />
                              </td>
                            </tr>
                          );
                        })}
                        {selectedClientOrders.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No hay documentos pendientes.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end items-center gap-4">
                    <span className="text-sm font-bold text-gray-500 uppercase">Total Distribuido:</span>
                    <span className={`text-lg font-black ${Math.abs(Number(paymentTotal || 0) - getTotalDistribuido()) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                      $${getTotalDistribuido().toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="printReceipt"
                    checked={printReceipt}
                    onChange={(e) => setPrintReceipt(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="printReceipt" className="text-sm font-bold text-gray-700 cursor-pointer">
                    Imprimir recibo de cobro al confirmar
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50 mt-auto shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsAbonoModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={!paymentTotal || Number(paymentTotal) <= 0 || Math.abs(Number(paymentTotal) - getTotalDistribuido()) > 0.01}
                  className="px-4 py-2 bg-[#2563EB] text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirmar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
