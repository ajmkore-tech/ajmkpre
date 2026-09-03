const fs = require('fs');
let code = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

// Hide edit button on Client Details card
code = code.replace(
    /<button onClick=\{\(\) => handleEditSale\(selectedSale\)\} className="absolute top-3 right-3 p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Editar Pedido">/,
    `{selectedSale.estado !== 'Cerrado' && (\n                 <button onClick={() => handleEditSale(selectedSale)} className="absolute top-3 right-3 p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Editar Pedido">`
);
code = code.replace(
    /<FileEdit className="w-4 h-4" \/>\n                 <\/button>/,
    `<FileEdit className="w-4 h-4" />\n                 </button>\n                 )}`
);

// Hide edit button on Articles section
code = code.replace(
    /<button onClick=\{\(\) => handleEditSale\(selectedSale\)\} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">/,
    `{selectedSale.estado !== 'Cerrado' && (\n                 <button onClick={() => handleEditSale(selectedSale)} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">`
);
code = code.replace(
    /<FileEdit className="w-3.5 h-3.5" \/> Editar Pedido\n                 <\/button>/,
    `<FileEdit className="w-3.5 h-3.5" /> Editar Pedido\n                 </button>\n                 )}`
);

// Modify the condition for the Eliminar button from !== 'Cobrado' to !== 'Cerrado' (or similar logic)
code = code.replace(
    /\{selectedSale\.estado !== 'Cobrado' && \(/,
    `{selectedSale.estado !== 'Cerrado' && (`
);

fs.writeFileSync('src/pages/Sales.tsx', code);
