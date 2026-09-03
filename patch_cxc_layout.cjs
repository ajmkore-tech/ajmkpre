const fs = require('fs');
let code = fs.readFileSync('src/pages/CxC.tsx', 'utf8');

// 1. Add state for selectedSale
code = code.replace(
  /const \[isAbonoModalOpen, setIsAbonoModalOpen\] = useState\(false\);/,
  "const [isAbonoModalOpen, setIsAbonoModalOpen] = useState(false);\n  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);"
);

// 2. Change the layout of the main div
// Instead of `<div className="flex-1 overflow-auto p-6">`, we need `<div className="flex-1 flex overflow-hidden">`
// And inside, we have the main list, and then the detail view.

const oldLayoutStart = `<div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">`;

const newLayoutStart = `<div className="flex-1 flex overflow-hidden">
        <div className={\`flex-1 overflow-auto p-6 \${selectedSale ? 'hidden lg:block' : 'block'}\`}>
          <div className="max-w-5xl mx-auto space-y-6">`;

code = code.replace(oldLayoutStart, newLayoutStart);

// 3. Make the rows clickable to set selectedSale
// For 'pendientes'
code = code.replace(
  /<div key=\{order\.id\} className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-gray-50 transition-colors">/g,
  `<div key={order.id} onClick={() => setSelectedSale(order)} className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer">`
);

// For 'movimientos'
code = code.replace(
  /<tr key=\{mov\.id\} onClick=\{\(\) => navigate\(\`\/ventas\?pedido=\$\{mov\.pedidoId\}\`\)\} className="hover:bg-blue-50\/50 transition-colors cursor-pointer group">/g,
  `<tr key={mov.id} onClick={() => { const sale = sales.find(s => s.id === mov.pedidoId); if (sale) setSelectedSale(sale); }} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">`
);

// 4. Add the right pane at the end of the flex container
const oldLayoutEnd = `              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 p-12">
              <div className="text-center">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">Seleccione un Cliente</h3>
                <p className="text-gray-500">Elija un cliente del menú desplegable para ver su estado de cuenta.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Abono Modal */}`;

// Let's find exactly how the oldLayout ends. We might need a regex or search dynamically.
