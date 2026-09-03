import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, Calendar, DollarSign, Wallet, FileText, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Purchase, Expense, PaymentRecord } from '../types';

type SourceType = 'Compra' | 'Gasto';

export default function CxP() {
  const { purchases, setPurchases, expenses, setExpenses, companyConfig, rates, activeRate } = useAppContext();
  const [activeTab, setActiveTab] = useState<'Pendientes' | 'Vencidas' | 'Pagadas'>('Pendientes');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<{id: string, type: SourceType} | null>(null);
  
  const defaultRate = rates[activeRate.toLowerCase() as 'bcv' | 'eur'] || 1;
  const [paymentData, setPaymentData] = useState({ 
    amount: '', 
    method: companyConfig.paymentMethods?.[0]?.name || '', 
    bank: companyConfig.bancos?.[0]?.name || '',
    reference: '',
    rate: defaultRate
  });

  const allDebts = useMemo(() => {
    const list: any[] = [];
    purchases.forEach(p => {
      if (p.condicionPago === 'Crédito' && p.estado !== 'Anulada' && p.estado !== 'Borrador') {
        const isVencida = p.fechaVencimiento ? new Date(p.fechaVencimiento) < new Date() : false;
        list.push({
          id: p.id,
          type: 'Compra',
          proveedor: p.proveedorNombre,
          fecha: p.fecha,
          fechaVencimiento: p.fechaVencimiento,
          documento: p.numeroFactura || p.id,
          total: p.total,
          pagado: p.montoPagado,
          isVencida,
          estadoCxP: p.montoPagado >= p.total ? 'Pagadas' : (isVencida ? 'Vencidas' : 'Pendientes'),
          pagos: p.pagos || []
        });
      }
    });
    expenses.forEach(e => {
      if (e.condicionPago === 'Crédito' && e.estado !== 'Anulado') {
        const isVencida = e.fechaVencimiento ? new Date(e.fechaVencimiento) < new Date() : false;
        list.push({
          id: e.id,
          type: 'Gasto',
          proveedor: e.proveedorNombre || 'N/A',
          fecha: e.fecha,
          fechaVencimiento: e.fechaVencimiento,
          documento: e.id,
          total: e.monto,
          pagado: e.montoPagado,
          isVencida,
          estadoCxP: e.montoPagado >= e.monto ? 'Pagadas' : (isVencida ? 'Vencidas' : 'Pendientes'),
          pagos: e.pagos || []
        });
      }
    });
    return list;
  }, [purchases, expenses]);

  const filteredDebts = allDebts.filter(d => 
    (activeTab === 'Pendientes' ? (d.estadoCxP === 'Pendientes' || d.estadoCxP === 'Vencidas') : d.estadoCxP === activeTab) &&
    (d.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) || d.documento.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  const openPaymentModal = (debt: any) => {
    setSelectedDebt({ id: debt.id, type: debt.type });
    setPaymentData({
      amount: (debt.total - debt.pagado).toFixed(2),
      method: companyConfig.paymentMethods?.[0]?.name || '',
      bank: companyConfig.bancos?.[0]?.name || '',
      reference: '',
      rate: defaultRate
    });
    setIsPaymentModalOpen(true);
  };

  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebt) return;
    
    const amountNum = parseFloat(paymentData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Ingrese un monto válido.");
      return;
    }

    const newPayment: PaymentRecord = {
      id: Math.random().toString(36).substr(2, 9),
      fecha: new Date().toISOString(),
      monto: amountNum,
      metodoPago: paymentData.method,
      banco: paymentData.bank,
      referencia: paymentData.reference,
      tasa: paymentData.rate
    };

    if (selectedDebt.type === 'Compra') {
      setPurchases(prev => prev.map(p => {
        if (p.id === selectedDebt.id) {
          const newPagado = p.montoPagado + amountNum;
          return { ...p, montoPagado: newPagado, pagos: [...(p.pagos || []), newPayment] };
        }
        return p;
      }));
    } else {
      setExpenses(prev => prev.map(exp => {
        if (exp.id === selectedDebt.id) {
          const newPagado = exp.montoPagado + amountNum;
          return { ...exp, montoPagado: newPagado, estado: newPagado >= exp.monto ? 'Pagado' : exp.estado, pagos: [...(exp.pagos || []), newPayment] };
        }
        return exp;
      }));
    }

    setIsPaymentModalOpen(false);
    setSelectedDebt(null);
  };

  const totalPorPagar = allDebts.filter(d => d.estadoCxP !== 'Pagadas').reduce((acc, d) => acc + (d.total - d.pagado), 0);
  const totalVencido = allDebts.filter(d => d.estadoCxP === 'Vencidas').reduce((acc, d) => acc + (d.total - d.pagado), 0);

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-[#0B1120] font-montserrat tracking-tight">Cuentas por Pagar</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Gestiona tus obligaciones con proveedores y gastos fijos.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-red-50 px-4 py-2 rounded-xl border border-red-100 flex flex-col items-end justify-center">
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Total Vencido</span>
            <span className="text-lg font-black text-red-700">${totalVencido.toFixed(2)}</span>
          </div>
          <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 flex flex-col items-end justify-center">
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Total por Pagar</span>
            <span className="text-lg font-black text-orange-700">${totalPorPagar.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-8">
        <div className="bg-white flex-1 rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setActiveTab('Pendientes')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'Pendientes' ? 'bg-[#0B1120] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                Pendientes
              </button>
              <button 
                onClick={() => setActiveTab('Vencidas')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'Vencidas' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                Vencidas {totalVencido > 0 && <span className="bg-white text-red-600 px-1.5 py-0.5 rounded text-[10px]">!</span>}
              </button>
              <button 
                onClick={() => setActiveTab('Pagadas')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'Pagadas' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                Historial de Pagos
              </button>
            </div>
            
            <div className="relative w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Buscar proveedor o doc..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Fecha / Venc.</th>
                  <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Documento</th>
                  <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Proveedor / Tipo</th>
                  <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider text-right">Total</th>
                  <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider text-right">Saldo</th>
                  <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDebts.length > 0 ? (
                  filteredDebts.map((debt, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#0B1120]">{new Date(debt.fecha).toLocaleDateString()}</div>
                        {debt.fechaVencimiento && (
                          <div className={`text-xs font-bold mt-0.5 flex items-center gap-1 ${debt.isVencida && debt.estadoCxP !== 'Pagadas' ? 'text-red-600' : 'text-gray-500'}`}>
                            {debt.isVencida && debt.estadoCxP !== 'Pagadas' && <AlertCircle className="w-3 h-3" />}
                            Vence: {new Date(debt.fechaVencimiento).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm font-bold text-[#0B1120]">{debt.documento}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-[#0B1120] uppercase">{debt.proveedor}</div>
                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{debt.type}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                        ${debt.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-orange-600 text-right">
                        ${(debt.total - debt.pagado).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {debt.estadoCxP !== 'Pagadas' && (
                          <button 
                            onClick={() => openPaymentModal(debt)}
                            className="bg-[#2563EB] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
                          >
                            <Wallet className="w-3.5 h-3.5" /> Abonar
                          </button>
                        )}
                        {debt.estadoCxP === 'Pagadas' && (
                          <span className="text-green-600 font-bold text-xs flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Pagado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 font-medium">
                      No hay registros que coincidan con tu búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedDebt && (
        <div className="fixed inset-0 bg-[#0B1120]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-black text-[#0B1120] font-montserrat uppercase tracking-wider">Registrar Abono</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FileText className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRegisterPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Monto a Abonar (USD)</label>
                <div className="relative">
                  <DollarSign className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={paymentData.amount}
                    onChange={e => setPaymentData({...paymentData, amount: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-lg font-black focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Método de Pago</label>
                  <select
                    value={paymentData.method}
                    onChange={e => setPaymentData({...paymentData, method: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-bold"
                  >
                    {companyConfig.paymentMethods?.map(pm => (
                      <option key={pm.name} value={pm.name}>{pm.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Banco Origen</label>
                  <select
                    value={paymentData.bank}
                    onChange={e => setPaymentData({...paymentData, bank: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-bold"
                  >
                    <option value="">Seleccione Banco...</option>
                    {companyConfig.bancos?.map(b => (
                      <option key={b.name} value={b.name}>{b.name} ({b.moneda})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Tasa de Cambio Aplicada</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentData.rate}
                  onChange={e => setPaymentData({...paymentData, rate: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Nro. Referencia (Opcional)</label>
                <input
                  type="text"
                  value={paymentData.reference}
                  onChange={e => setPaymentData({...paymentData, reference: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all font-mono uppercase"
                  placeholder="0000000000"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0B1120] hover:bg-gray-800 transition-colors uppercase tracking-wider"
                >
                  Confirmar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
