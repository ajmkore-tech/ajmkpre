const fs = require('fs');
let code = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

code = code.replace(
    /<div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-6">/,
    `<div className="pt-4 border-t border-gray-100 flex flex-col items-end gap-2 mt-6">
                {closingError && <div className="text-red-500 text-xs font-bold text-right">{closingError}</div>}
                <div className="flex gap-3">`
);

code = code.replace(
    /<CheckCircle2 className="w-4 h-4" \/> Confirmar Cierre\s*<\/button>\s*<\/div>/,
    `<CheckCircle2 className="w-4 h-4" /> Confirmar Cierre\n                </button>\n                </div>\n              </div>`
);


fs.writeFileSync('src/pages/Sales.tsx', code);
