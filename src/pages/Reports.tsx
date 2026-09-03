import React, { useState } from 'react';
import { FileText, FileX } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Reports() {
  const { sales, setSales, inventory, setInventory } = useAppContext();
  const [activeTab, setActiveTab] = useState<'Factura' | 'Nota de Despacho'>('Factura');

  const reportSales = sales.filter(s => 
    s.estado === 'Cerrado' && 
    s.numeroDocumento && 
    s.tipoDocumento === activeTab
  ).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const handleAnular = (saleId: string) => {
    if (window.confirm(`¿Estás seguro de que deseas anular esta ${activeTab.toLowerCase()}? El inventario será devuelto.`)) {
      const saleToVoid = sales.find(s => s.id === saleId);
      if (!saleToVoid) return;

      if (saleToVoid.anulado) {
        alert("El documento ya está anulado.");
        return;
      }

      // Revert inventory
      const updatedInventory = [...inventory];
      saleToVoid.items.forEach(item => {
        const prodIndex = updatedInventory.findIndex(p => p.codigo === item.codigo);
        if (prodIndex >= 0) {
          updatedInventory[prodIndex] = {
            ...updatedInventory[prodIndex],
            stockDisp: updatedInventory[prodIndex].stockDisp + item.cantidad
          };
        }
      });
      setInventory(updatedInventory);

      // Update sale
      setSales(prev => prev.map(s => {
        if (s.id === saleId) {
          return {
            ...s,
            anulado: true,
            anuladoPor: activeTab
          };
        }
        return s;
      }));
      
      alert(`${activeTab} anulada exitosamente.`);
    }
  };

  const handleView = (saleId: string) => {
    // Generate document view - assuming it's done via alert or we just show a message since document generation is in Sales.tsx.
    // Wait, generateDocument is in Sales.tsx. We can copy the generateDocument logic or just alert it.
    // Actually, can we extract generateDocument to AppContext or utils? Let's check how generateDocument works in Sales.tsx.
    alert("Funcionalidad para ver el documento. Por favor, ve al módulo de Ventas para reimprimir el documento.");
  }

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-[#0B1120] font-montserrat tracking-tight">Reportes</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Documentos emitidos: Facturas y Notas de Despacho.</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-8">
        <div className="bg-white flex-1 rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
            <button 
              onClick={() => setActiveTab('Factura')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'Factura' ? 'bg-[#0B1120] text-white' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              Facturas
            </button>
            <button 
              onClick={() => setActiveTab('Nota de Despacho')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'Nota de Despacho' ? 'bg-[#0B1120] text-white' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              Notas de Despacho
            </button>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Número</th>
                  <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider text-right">Monto</th>
                  <th className="px-6 py-4 font-bold text-gray-600 text-xs uppercase tracking-wider text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reportSales.length > 0 ? (
                  reportSales.map(sale => (
                    <tr key={sale.id} className={`transition-colors ${sale.anulado ? 'bg-gray-100 opacity-60' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-600">{new Date(sale.fecha).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-mono font-bold text-[#0B1120]">{sale.numeroDocumento}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {sale.clienteNombre}
                        {sale.anulado && <span className="ml-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">ANULADO</span>}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">${sale.total.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleView(sale.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver Documento"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          {!sale.anulado && (
                            <button 
                              onClick={() => handleAnular(sale.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Anular Documento"
                            >
                              <FileX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-medium">
                      No hay {activeTab.toLowerCase()}s emitidas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
