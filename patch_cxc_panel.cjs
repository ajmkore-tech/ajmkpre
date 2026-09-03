const fs = require('fs');
let code = fs.readFileSync('src/pages/CxC.tsx', 'utf8');
let statusHelpers = fs.readFileSync('status_helpers.txt', 'utf8');

// 1. Add imports if needed. We need ArrowLeft from lucide-react.
if (!code.includes('ArrowLeft')) {
    code = code.replace(/import \{ Search, DollarSign, Calendar, Clock, CreditCard, ChevronDown, CheckCircle2, User, X, FileText, ArrowRight, History \} from 'lucide-react';/, 
      "import { Search, DollarSign, Calendar, Clock, CreditCard, ChevronDown, CheckCircle2, User, X, FileText, ArrowRight, History, ArrowLeft } from 'lucide-react';");
}

// 2. Add status helpers inside the component
code = code.replace(/const getTotalDistribuido = \(\) => \{/, statusHelpers + "\n\n  const getTotalDistribuido = () => {");

// 3. Inject selectedSale state and layout wrapper
code = code.replace(
  /const \[isAbonoModalOpen, setIsAbonoModalOpen\] = useState\(false\);/,
  "const [isAbonoModalOpen, setIsAbonoModalOpen] = useState(false);\n  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);"
);

// 4. Change the rows to update selectedSale
code = code.replace(
  /<div key=\{order\.id\} className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-gray-50 transition-colors">/g,
  `<div key={order.id} onClick={() => setSelectedSale(order)} className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer">`
);

code = code.replace(
  /<tr key=\{mov\.id\} onClick=\{\(\) => navigate\(\`\/ventas\?pedido=\$\{mov\.pedidoId\}\`\)\} className="hover:bg-blue-50\/50 transition-colors cursor-pointer group">/g,
  `<tr key={mov.id} onClick={() => { const sale = sales.find(s => s.id === mov.pedidoId); if (sale) setSelectedSale(sale); }} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">`
);

// 5. Build the layout wrapping
const oldLayoutStart = `<div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">`;

const newLayoutStart = `<div className="flex-1 flex overflow-hidden">
        <div className={\`flex-1 overflow-auto p-6 custom-scrollbar \${selectedSale ? 'hidden lg:block lg:max-w-md xl:max-w-lg border-r border-gray-200' : 'block'}\`}>
          <div className="max-w-5xl mx-auto space-y-6">`;

code = code.replace(oldLayoutStart, newLayoutStart);

// 6. Append the right pane right before {/* Abono Modal */}
const rightPaneCode = `
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
                    <div className={\`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider \${getStatusColor(selectedSale.estado)}\`}>
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
                            <td className="px-3 py-2 text-right text-gray-600">$\${item.precio.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right font-black text-[#10B981]">$\${item.total.toFixed(2)}</td>
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
                          <span className="text-sm font-bold text-gray-700">$\${(selectedSale.total / (1 + (companyConfig.ivaVenta ?? 16) / 100)).toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[9px] font-bold text-gray-500 uppercase">IVA ({companyConfig.ivaVenta ?? 16}%)</span>
                          <span className="text-sm font-bold text-gray-700">$\${(selectedSale.total - (selectedSale.total / (1 + (companyConfig.ivaVenta ?? 16) / 100))).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col text-right sm:pl-6 sm:border-l sm:border-gray-200 mt-2 sm:mt-0">
                      <span className="text-[9px] font-bold text-gray-500 uppercase">Total {selectedSale.tipoDocumento === 'Factura' ? '(con IVA)' : ''}</span>
                      <div className="flex items-baseline gap-2 justify-end">
                        <span className="text-2xl font-black text-[#10B981] leading-none">$\${selectedSale.total.toFixed(2)}</span>
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

      {/* Abono Modal */}`;

code = code.replace(
  /        <\/div>\s*<\/div>\s*\{\/\* Abono Modal \*\/\}/,
  rightPaneCode
);

fs.writeFileSync('src/pages/CxC.tsx', code);
