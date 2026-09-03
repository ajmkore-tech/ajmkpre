const fs = require('fs');
let code = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

code = code.replace(
    /className=\{\`flex flex-col flex-1 border-r border-gray-200 \$\{selectedSale \? 'hidden' : 'flex'\}\`\}/,
    "className={`flex flex-col flex-1 border-r border-gray-200 ${selectedSale ? 'hidden lg:flex lg:max-w-md xl:max-w-lg' : 'flex'}`}"
);

code = code.replace(
    /<button onClick=\{\(\) => setSelectedSale\(null\)\} className="mb-4 text-sm font-bold text-gray-500 hover:text-\[\#2563EB\] flex items-center gap-1 transition-colors">/,
    '<button onClick={() => setSelectedSale(null)} className="lg:hidden mb-4 text-sm font-bold text-gray-500 hover:text-[#2563EB] flex items-center gap-1 transition-colors">'
);

fs.writeFileSync('src/pages/Sales.tsx', code);
