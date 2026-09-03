import React from 'react';
import { X, CreditCard, DollarSign, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function CloseSaleModal({ state }: { state: any }) {
  const {
    isClosingModalOpen, setIsClosingModalOpen, closingSale, setClosingSale,
    closingData, setClosingData, closingError, setClosingError, handleCloseSaleSubmit,
    rates, activeRate, formatBs, companyConfig
  } = state;

  return (
    
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <h2 className="text-lg font-black text-[#0B1120] font-montserrat tracking-tight">{closingSale.tipoPrecio === 'Mayorista' ? 'Entregar y Cobrar' : 'Cerrar Venta'} - {closingSale.id}</h2>
              <button onClick={() => { setIsClosingModalOpen(false); setClosingError(null); }} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleCloseSaleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                   <div className="text-xs font-bold text-blue-600 mb-1 uppercase tracking-wider">Monto Total USD</div>
                   <div className="text-2xl font-black text-[#0B1120]">${closingSale.total.toFixed(2)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                   <div className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Monto Total Bs</div>
                   <div className="text-2xl font-black text-[#0B1120]">Bs. {(closingSale.total * (closingData.tasa || 1)).toFixed(2)}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Tasa a aplicar {closingSale.tipoPrecio === "Minorista" ? `(${state.minoristaRate})` : `(${activeRate})`}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                  </div>
                  <input 
                    type="number" 
                    step="0.01"
                    value={closingData.tasa} 
                    onChange={e => setClosingData({...closingData, tasa: Number(e.target.value)})}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Monto a cobrar $</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                  </div>
                  <input 
                    type="number" 
                    step="0.01"
                    value={closingData.amountToPay} 
                    onChange={e => { setClosingData({...closingData, amountToPay: e.target.value}); setClosingError(null); }}
                    placeholder={`Ej. ${closingSale.total.toFixed(2)}`}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Tipo de Pago</label>
                <select
                  value={closingData.paymentMethod}
                  onChange={e => setClosingData({...closingData, paymentMethod: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  required
                >
                  <option value="" disabled>Seleccione un método</option>
                  {companyConfig?.paymentMethods?.map(pm => (
                    <option key={pm.name} value={pm.name}>{pm.name}</option>
                  ))}
                </select>
              </div>

              {companyConfig?.paymentMethods?.find(pm => pm.name === closingData.paymentMethod)?.requiresRef && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Número de Referencia</label>
                  <input 
                    type="text" 
                    value={closingData.reference} 
                    onChange={e => setClosingData({...closingData, reference: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    required
                  />
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex flex-col items-end gap-2 mt-6">
                {closingError && <div className="text-red-500 text-xs font-bold text-right">{closingError}</div>}
                <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => { setIsClosingModalOpen(false); setClosingError(null); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-[#10B981] text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-500/20 font-montserrat uppercase tracking-wider flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirmar Cierre
                </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      
  );
}
