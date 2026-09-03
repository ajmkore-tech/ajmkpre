const fs = require('fs');
let lines = fs.readFileSync('src/pages/Sales.tsx', 'utf8').split('\n');

const start = lines.findIndex(l => l.includes('const handleCloseSaleSubmit = '));
const end = lines.findIndex(l => l.includes('const modalState = '));

const newLogic = `  const handleCloseSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingSale) return;
    const amountPaid = Number(closingData.amountToPay);
    if (isNaN(amountPaid) || amountPaid < 0) {
      setClosingError("Ingrese un monto válido a cobrar.");
      return;
    }
    if (closingSale.condicionPago === 'Contado') {
      if (Math.abs(amountPaid - closingSale.total) > 0.01) {
        setClosingError("En ventas de contado el monto a cobrar debe ser exacto al total de la venta en USD ($" + closingSale.total.toFixed(2) + ").");
        return;
      }
    } else {
      if (amountPaid > closingSale.total + 0.01) {
        setClosingError("El monto a cobrar no puede ser mayor al total de la venta.");
        return;
      }
    }
    
    let finalUpdatedSale: Sale | null = null;
    
    setSales(prev => prev.map(s => {
      if (s.id === closingSale.id) {
        // Handle inventory for Minorista that goes directly from Registrado/Cotizacion to Cerrado
        if (s.estado === 'Registrado/Cotizacion' && s.tipoPrecio === 'Minorista') {
          const updatedInventory = [...inventory];
          s.items.forEach(item => {
            const prodIndex = updatedInventory.findIndex(p => p.codigo === item.codigo);
            if (prodIndex >= 0) {
              const qtyToDeduct = item.esEmpaque ? item.cantidad : (item.cantidad / (item.unidadesPorEmpaque || 1));
              updatedInventory[prodIndex] = {
                ...updatedInventory[prodIndex],
                stockDisp: updatedInventory[prodIndex].stockDisp - qtyToDeduct
              };
            }
          });
          setInventory(updatedInventory);
        } else if (s.estado === 'Confirmado' && s.tipoPrecio === 'Mayorista') {
          const updatedInventory = [...inventory];
          s.items.forEach(item => {
            const prodIndex = updatedInventory.findIndex(p => p.codigo === item.codigo);
            if (prodIndex >= 0) {
              updatedInventory[prodIndex] = {
                ...updatedInventory[prodIndex],
                stockComp: Math.max(0, (updatedInventory[prodIndex].stockComp || 0) - item.cantidad)
              };
            }
          });
          setInventory(updatedInventory);
        }
        
        const targetStatus = closingSale.tipoPrecio === 'Mayorista' ? ('Entregado' as SaleStatus) : ('Cerrado' as SaleStatus);
        
        const updatedSale = {
           ...s,
           estado: targetStatus,
           montoPagado: amountPaid,
           tasaAplicada: closingData.tasa,
           fechaEstado: new Date().toISOString(),
           auditLog: [...(s.auditLog || []), { date: new Date().toISOString(), action: closingSale.tipoPrecio === 'Mayorista' ? 'Entregado y Cobrado' : 'Cerrado' }]
        };
        
        if (selectedSale?.id === s.id) {
          setSelectedSale(updatedSale);
        }
        finalUpdatedSale = updatedSale;
        return updatedSale;
      }
      return s;
    }));
    
    setIsClosingModalOpen(false);
    setClosingSale(null);
    alert(\`Venta cerrada exitosamente. \${amountPaid < closingSale.total ? 'El saldo restante irá a Cuentas por Cobrar.' : 'Total pagado en su totalidad.'}\`);
    if (finalUpdatedSale) {
      setTimeout(() => generateDocument(finalUpdatedSale!, selectedSale, setSelectedSale), 100);
    }
  };
`;

lines.splice(start, end - start, newLogic);
fs.writeFileSync('src/pages/Sales.tsx', lines.join('\n'));
