const fs = require('fs');
let lines = fs.readFileSync('src/pages/Sales.tsx', 'utf8').split('\n');

const start = lines.findIndex(l => l.includes('const handleDeleteSale = '));
const end = lines.findIndex(l => l.includes('const handleSaveOrder = '));

const newLogic = `  const handleDeleteSale = (saleId: string) => {
    const saleToDelete = sales.find(s => s.id === saleId);
    if (!saleToDelete) return;
    if (saleToDelete.estado === 'Cerrado') {
      alert("No se puede eliminar un pedido que ya ha sido cerrado/cobrado.");
      return;
    }
    if (window.confirm("¿Estás seguro de eliminar este pedido? El inventario será devuelto.")) {
      const updatedInventory = [...inventory];
      
      saleToDelete.items.forEach(item => {
        const prodIndex = updatedInventory.findIndex(p => p.codigo === item.codigo);
        if (prodIndex >= 0) {
          if (saleToDelete.estado === 'Confirmado') {
            updatedInventory[prodIndex] = {
              ...updatedInventory[prodIndex],
              stockDisp: updatedInventory[prodIndex].stockDisp + item.cantidad,
              stockComp: Math.max(0, (updatedInventory[prodIndex].stockComp || 0) - item.cantidad)
            };
          } else if (saleToDelete.estado === 'Entregado') { 
             updatedInventory[prodIndex] = {
              ...updatedInventory[prodIndex],
              stockDisp: updatedInventory[prodIndex].stockDisp + item.cantidad
            };
          }
        }
      });
      setInventory(updatedInventory);
      
      // Remove sale
      setSales(sales.filter(s => s.id !== saleId));
      if (selectedSale?.id === saleId) {
        setSelectedSale(null);
      }
    }
  };
`;

lines.splice(start, end - start, newLogic);
fs.writeFileSync('src/pages/Sales.tsx', lines.join('\n'));
