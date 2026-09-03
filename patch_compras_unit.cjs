const fs = require('fs');
let code = fs.readFileSync('src/pages/Compras.tsx', 'utf8');

const oldFunc = `  const handlePurchaseItemChange = (index: number, field: string, value: any) => {
    const newItems = [...purchaseItems];
    const item = newItems[index];
    (item as any)[field] = value;
    if (field === 'cantidadPedida') {
        item.total = (value || 0) * (item.costoUnitario || 0);
    }
    setPurchaseItems(newItems);
  };`;

const newFunc = `  const handlePurchaseItemChange = (index: number, field: string, value: any) => {
    const newItems = [...purchaseItems];
    const item = newItems[index];
    
    if (field === 'esCaja') {
      const wasCaja = item.esCaja;
      const isCaja = value;
      item.esCaja = isCaja;
      const factor = item.unidadesPorCaja || 1;
      
      if (wasCaja !== isCaja && factor > 1) {
        if (!isCaja) {
          item.costoUnitario = item.costoUnitario / factor;
          item.costoAntiguo = item.costoAntiguo / factor;
          item.precioMinoristaActual = item.precioMinoristaActual / factor;
          item.precioMayoristaActual = item.precioMayoristaActual / factor;
          item.nuevoPrecioMinorista = item.nuevoPrecioMinorista / factor;
          item.nuevoPrecioMayorista = item.nuevoPrecioMayorista / factor;
        } else {
          item.costoUnitario = item.costoUnitario * factor;
          item.costoAntiguo = item.costoAntiguo * factor;
          item.precioMinoristaActual = item.precioMinoristaActual * factor;
          item.precioMayoristaActual = item.precioMayoristaActual * factor;
          item.nuevoPrecioMinorista = item.nuevoPrecioMinorista * factor;
          item.nuevoPrecioMayorista = item.nuevoPrecioMayorista * factor;
        }
        item.total = (item.cantidadPedida || 0) * (item.costoUnitario || 0);
      }
    } else {
      (item as any)[field] = value;
      if (field === 'cantidadPedida') {
          item.total = (value || 0) * (item.costoUnitario || 0);
      }
    }
    setPurchaseItems(newItems);
  };`;

code = code.replace(oldFunc, newFunc);
fs.writeFileSync('src/pages/Compras.tsx', code);
