const fs = require('fs');
let code = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

const targetStr = `                 <div className="bg-[#F8FAFC] p-4 flex justify-end border-t border-gray-100">
                    <div className="text-right">
                      {tipoDocumento === 'Factura' && (
                        <>
                          <div className="flex justify-between gap-8 text-sm font-bold text-gray-500 mb-1">
                            <span>Subtotal:</span>
                            <span>\${orderItems.reduce((acc, i) => acc + (i.total || 0), 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-8 text-sm font-bold text-gray-500 mb-2 border-b border-gray-200 pb-2">
                            <span>IVA ({companyConfig.ivaVenta ?? 16}%):</span>
                            <span>\${(orderItems.reduce((acc, i) => acc + (i.total || 0), 0) * ((companyConfig.ivaVenta ?? 16) / 100)).toFixed(2)}</span>
                          </div>
                        </>
                      )}
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Pedido {tipoDocumento === 'Factura' ? '(con IVA)' : ''}</div>
                      <div className="text-2xl font-black text-[#10B981]">
                        \${(tipoDocumento === 'Factura' ? orderItems.reduce((acc, i) => acc + (i.total || 0), 0) * (1 + (companyConfig.ivaVenta ?? 16) / 100) : orderItems.reduce((acc, i) => acc + (i.total || 0), 0)).toFixed(2)}
                      </div>
                      <div className="text-xs font-bold text-gray-400 mt-1">Bs. {((tipoDocumento === 'Factura' ? orderItems.reduce((acc, i) => acc + (i.total || 0), 0) * (1 + (companyConfig.ivaVenta ?? 16) / 100) : orderItems.reduce((acc, i) => acc + (i.total || 0), 0)) * (orderRate || 1)).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                 </div>`;

const replacementStr = `                 <div className="bg-[#F8FAFC] p-3 flex justify-between items-end border-t border-gray-100 shrink-0">
                    <div></div>
                    <div className="flex gap-6 items-end text-right">
                      {tipoDocumento === 'Factura' && (
                        <div className="flex flex-col border-r border-gray-200 pr-6 gap-1">
                          <div className="flex justify-between gap-4 text-xs font-bold text-gray-500">
                            <span>Subtotal:</span>
                            <span>\${orderItems.reduce((acc, i) => acc + (i.total || 0), 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-xs font-bold text-gray-500">
                            <span>IVA ({companyConfig.ivaVenta ?? 16}%):</span>
                            <span>\${(orderItems.reduce((acc, i) => acc + (i.total || 0), 0) * ((companyConfig.ivaVenta ?? 16) / 100)).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col pl-2">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Total {tipoDocumento === 'Factura' ? '(con IVA)' : ''}</div>
                        <div className="text-xl font-black text-[#10B981] leading-none">
                          \${(tipoDocumento === 'Factura' ? orderItems.reduce((acc, i) => acc + (i.total || 0), 0) * (1 + (companyConfig.ivaVenta ?? 16) / 100) : orderItems.reduce((acc, i) => acc + (i.total || 0), 0)).toFixed(2)}
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 mt-0.5">Bs. {((tipoDocumento === 'Factura' ? orderItems.reduce((acc, i) => acc + (i.total || 0), 0) * (1 + (companyConfig.ivaVenta ?? 16) / 100) : orderItems.reduce((acc, i) => acc + (i.total || 0), 0)) * (orderRate || 1)).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                 </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/pages/Sales.tsx', code);
  console.log("Successfully replaced totals.");
} else {
  console.log("Could not find totals target string.");
}
