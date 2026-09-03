const fs = require('fs');
let code = fs.readFileSync('src/pages/Compras.tsx', 'utf8');

const mapStart = `{purchaseItems.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">`;

const mapReplacement = `{purchaseItems.map((item, index) => {
                          const mAntMay = item.costoAntiguo > 0 ? ((item.precioMayoristaActual - item.costoAntiguo)/item.costoAntiguo)*100 : 0;
                          const mAntMin = item.costoAntiguo > 0 ? ((item.precioMinoristaActual - item.costoAntiguo)/item.costoAntiguo)*100 : 0;
                          
                          const mNvoMay = item.costoUnitario > 0 ? ((item.nuevoPrecioMayorista - item.costoUnitario)/item.costoUnitario)*100 : 0;
                          const mNvoMin = item.costoUnitario > 0 ? ((item.nuevoPrecioMinorista - item.costoUnitario)/item.costoUnitario)*100 : 0;

                          const diffMay = mNvoMay - mAntMay;
                          const diffMin = mNvoMin - mAntMin;
                          
                          return (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">`;

code = code.replace(mapStart, mapReplacement);

const oldMargins = `<td className="px-1 py-1 text-right text-gray-500 leading-tight">
                              <div className="text-[9px]">M: {(item.costoAntiguo > 0 ? ((item.precioMayoristaActual - item.costoAntiguo)/item.costoAntiguo)*100 : 0).toFixed(1)}%</div>
                              <div className="text-[9px]">m: {(item.costoAntiguo > 0 ? ((item.precioMinoristaActual - item.costoAntiguo)/item.costoAntiguo)*100 : 0).toFixed(1)}%</div>
                            </td>
                            <td className="px-1 py-1 text-right font-bold leading-tight">
                              <div className={\`text-[9px] \${item.costoUnitario > 0 && ((item.nuevoPrecioMayorista - item.costoUnitario)/item.costoUnitario)*100 < 0 ? 'text-red-500' : 'text-green-600'}\`}>M: {(item.costoUnitario > 0 ? ((item.nuevoPrecioMayorista - item.costoUnitario)/item.costoUnitario)*100 : 0).toFixed(1)}%</div>
                              <div className={\`text-[9px] \${item.costoUnitario > 0 && ((item.nuevoPrecioMinorista - item.costoUnitario)/item.costoUnitario)*100 < 0 ? 'text-red-500' : 'text-green-600'}\`}>m: {(item.costoUnitario > 0 ? ((item.nuevoPrecioMinorista - item.costoUnitario)/item.costoUnitario)*100 : 0).toFixed(1)}%</div>
                            </td>`;

const newMargins = `<td className="px-1 py-1 text-right text-gray-500 leading-tight">
                              <div className="text-[9px]">M: {mAntMay.toFixed(1)}%</div>
                              <div className="text-[9px]">m: {mAntMin.toFixed(1)}%</div>
                            </td>
                            <td className="px-1 py-1 text-right font-bold leading-tight">
                              <div className={\`text-[9px] flex justify-end gap-1 items-center \${mNvoMay < 0 ? 'text-red-500' : 'text-green-600'}\`}>
                                <span>M: {mNvoMay.toFixed(1)}%</span>
                                {Math.abs(diffMay) > 0.1 && (
                                  <span className={\`text-[7px] flex items-center \${diffMay > 0 ? 'text-green-500' : 'text-red-500'}\`}>
                                    {diffMay > 0 ? '↑' : '↓'}{Math.abs(diffMay).toFixed(1)}%
                                  </span>
                                )}
                              </div>
                              <div className={\`text-[9px] flex justify-end gap-1 items-center \${mNvoMin < 0 ? 'text-red-500' : 'text-green-600'}\`}>
                                <span>m: {mNvoMin.toFixed(1)}%</span>
                                {Math.abs(diffMin) > 0.1 && (
                                  <span className={\`text-[7px] flex items-center \${diffMin > 0 ? 'text-green-500' : 'text-red-500'}\`}>
                                    {diffMin > 0 ? '↑' : '↓'}{Math.abs(diffMin).toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            </td>`;

code = code.replace(oldMargins, newMargins);

const endMapOld = `</tr>
                        ))}
                      </tbody>`;

const endMapNew = `</tr>
                        );
                        })}
                      </tbody>`;
                      
code = code.replace(endMapOld, endMapNew);

fs.writeFileSync('src/pages/Compras.tsx', code);
