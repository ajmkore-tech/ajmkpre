const fs = require('fs');
let code = fs.readFileSync('src/pages/Compras.tsx', 'utf8');

const oldMargAnt = `<div className="text-[9px]">m: {(item.margenAnterior || 0).toFixed(1)}%</div>`;
const newMargAnt = `<div className="text-[9px]">m: {(item.costoAntiguo > 0 ? ((item.precioMinoristaActual - item.costoAntiguo)/item.costoAntiguo)*100 : 0).toFixed(1)}%</div>`;
code = code.replace(oldMargAnt, newMargAnt);

const oldMargNvo = `<td className="px-1 py-1 text-right font-bold text-gray-600 leading-tight">
                              <div className="text-[9px]">M: {(item.costoUnitario > 0 ? ((item.nuevoPrecioMayorista - item.costoUnitario)/item.costoUnitario)*100 : 0).toFixed(1)}%</div>
                              <div className="text-[9px]">m: {(item.nuevoMargen || 0).toFixed(1)}%</div>
                            </td>`;
                            
const newMargNvo = `<td className="px-1 py-1 text-right font-bold leading-tight">
                              <div className={\`text-[9px] \${item.costoUnitario > 0 && ((item.nuevoPrecioMayorista - item.costoUnitario)/item.costoUnitario)*100 < 0 ? 'text-red-500' : 'text-green-600'}\`}>M: {(item.costoUnitario > 0 ? ((item.nuevoPrecioMayorista - item.costoUnitario)/item.costoUnitario)*100 : 0).toFixed(1)}%</div>
                              <div className={\`text-[9px] \${item.costoUnitario > 0 && ((item.nuevoPrecioMinorista - item.costoUnitario)/item.costoUnitario)*100 < 0 ? 'text-red-500' : 'text-green-600'}\`}>m: {(item.costoUnitario > 0 ? ((item.nuevoPrecioMinorista - item.costoUnitario)/item.costoUnitario)*100 : 0).toFixed(1)}%</div>
                            </td>`;

code = code.replace(oldMargNvo, newMargNvo);

fs.writeFileSync('src/pages/Compras.tsx', code);
