const fs = require('fs');
let code = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

// 1. Add closingError state
if (!code.includes('closingError')) {
    code = code.replace(
        /const \[closingData, setClosingData\] = useState([^;]+);/,
        "const [closingData, setClosingData] = useState$1;\n  const [closingError, setClosingError] = useState<string | null>(null);"
    );
}

// 2. Hide master list when selectedSale is present
code = code.replace(
    /className=\{\`flex flex-col flex-1 border-r border-gray-200 \$\{selectedSale \? 'hidden lg:flex lg:max-w-md xl:max-w-lg' : 'flex'\}\`\}/,
    "className={`flex flex-col flex-1 border-r border-gray-200 ${selectedSale ? 'hidden' : 'flex'}`}"
);

// 3. Remove absolute X button and add a Back button in header
code = code.replace(
    /<div className="absolute top-4 right-4 z-10 lg:hidden">[\s\S]*?<\/button>\s*<\/div>/,
    ""
);

code = code.replace(
    /<div className="flex justify-between items-start mb-4">/,
    `<button onClick={() => setSelectedSale(null)} className="mb-4 text-sm font-bold text-gray-500 hover:text-[#2563EB] flex items-center gap-1 transition-colors"><ArrowLeft className="w-4 h-4" /> Volver a Pedidos</button>\n                <div className="flex justify-between items-start mb-4">`
);

// Need to import ArrowLeft if not already imported. Let's check imports.
if (!code.includes('ArrowLeft')) {
    code = code.replace('ArrowRight,', 'ArrowRight, ArrowLeft,');
}

// 4. Update the Cerrar modal to use setClosingError
code = code.replace(
    /alert\("Ingrese un monto válido a cobrar\."\);/,
    'setClosingError("Ingrese un monto válido a cobrar.");'
);

code = code.replace(
    /alert\("En ventas de contado el monto a cobrar debe ser exacto al total de la venta en USD \(\$" \+ closingSale\.total\.toFixed\(2\) \+ "\)\."\);/,
    'setClosingError("En ventas de contado el monto a cobrar debe ser exacto al total de la venta en USD ($" + closingSale.total.toFixed(2) + ").");'
);

code = code.replace(
    /alert\("El monto a cobrar no puede ser mayor al total de la venta\."\);/,
    'setClosingError("El monto a cobrar no puede ser mayor al total de la venta.");'
);

// clear closingError on modal close
code = code.replace(
    /onClick=\{\(\) => setIsClosingModalOpen\(false\)\}/g,
    "onClick={() => { setIsClosingModalOpen(false); setClosingError(null); }}"
);

// clear closingError when input changes
code = code.replace(
    /onChange=\{e => setClosingData\(\{\.\.\.closingData, amountToPay: e\.target\.value\}\)\}/,
    "onChange={e => { setClosingData({...closingData, amountToPay: e.target.value}); setClosingError(null); }}"
);


fs.writeFileSync('src/pages/Sales.tsx', code);
