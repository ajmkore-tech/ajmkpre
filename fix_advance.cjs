const fs = require('fs');
let lines = fs.readFileSync('src/pages/Sales.tsx', 'utf8').split('\n');

const startIndex = 110; // line 111 is advanceStatus
const endIndex = 180; // line 180 is inside handleDeleteSale, actually handleDeleteSale starts around 183. Let's find handleDeleteSale.

const deleteIndex = lines.findIndex(l => l.includes('const handleDeleteSale = '));
console.log('deleteIndex:', deleteIndex);

const newLogic = `
  const advanceStatus = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    if (sale.estado === 'Registrado/Cotizacion') {
      const hasZeroPrice = sale.items.some(i => i.precioUnitario <= 0);
      if (hasZeroPrice) {
        alert("Atención: Hay productos en la orden sin precio de venta asignado ($0). Debe establecer un precio antes de confirmar el pedido.");
        return;
      }
    }

    const action = getNextStatusAction(sale);
    if (action === 'Cerrar Venta' || action === 'Entregar Venta') {
      setClosingSale(sale);
      const appliedRate = (sale.tipoPrecio === 'Minorista') ? minoristaRate : activeRate;
      const defaultTasa = sale.tasaAplicada ? sale.tasaAplicada : Number((appliedRate === 'BCV' ? rates.bcv : rates.eur).toFixed(2));
      setClosingData({ tasa: defaultTasa, amountToPay: sale.total.toFixed(2), paymentMethod: companyConfig?.paymentMethods?.[0]?.name || '', reference: '' });
      setIsClosingModalOpen(true);
      return;
    }

    let finalUpdatedSale: Sale | null = null;
    
    setSales(prev => prev.map(s => {
      if (s.id === saleId) {
        let newStatus: SaleStatus = s.estado;
        
        if (s.estado === 'Registrado/Cotizacion') {
          newStatus = 'Confirmado';
          // Inventory: Increase stockComp, decrease stockDisp
          const updatedInventory = [...inventory];
          s.items.forEach(item => {
            const prodIndex = updatedInventory.findIndex(p => p.codigo === item.codigo);
            if (prodIndex >= 0) {
              const qtyToDeduct = item.esEmpaque ? item.cantidad : (item.cantidad / (item.unidadesPorEmpaque || 1));
              updatedInventory[prodIndex] = {
                ...updatedInventory[prodIndex],
                stockDisp: updatedInventory[prodIndex].stockDisp - qtyToDeduct,
                stockComp: (updatedInventory[prodIndex].stockComp || 0) + qtyToDeduct
              };
            }
          });
          setInventory(updatedInventory);
        } else if (s.estado === 'Confirmado') {
          newStatus = 'Entregado';
          // Inventory: Decrease stockComp
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
        
        const updatedSale = { ...s, estado: newStatus, fechaEstado: new Date().toISOString() };
        finalUpdatedSale = updatedSale;
        if (selectedSale?.id === saleId) {
          setSelectedSale(updatedSale);
        }
        return updatedSale;
      }
      return s;
    }));
  };
`;

lines.splice(startIndex, deleteIndex - startIndex, newLogic);
fs.writeFileSync('src/pages/Sales.tsx', lines.join('\n'));
