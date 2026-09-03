const fs = require('fs');
let code = fs.readFileSync('src/pages/Compras.tsx', 'utf8');

const oldBlock = `          invMap.set(item.codigo, {
            ...prod,
            stockDisp: currentStock + totalUnitsReceived,
            costoPromedio: newAvgCost,
            costoDolar: costPerUnit // Last cost
          });`;

const newBlock = `          // Add to history
          const historyEntry = {
            id: Math.random().toString(36).substring(2, 9),
            fecha: new Date().toISOString(),
            costo: costPerUnit,
            proveedorNombre: receivingPurchase.proveedorNombre || 'Desconocido',
            referencia: receivingPurchase.numeroFactura || receivingPurchase.id
          };
          const newHistory = [historyEntry, ...(prod.historialCostos || [])].slice(0, 50); // Keep last 50

          invMap.set(item.codigo, {
            ...prod,
            stockDisp: currentStock + totalUnitsReceived,
            costoPromedio: newAvgCost,
            ultimoCosto: costPerUnit,
            costoDolar: costPerUnit, // Last cost backwards comp.
            historialCostos: newHistory
          });`;

const oldBlock2 = `            costoPromedio: item.esCaja ? item.costoUnitario : (item.costoUnitario * (item.unidadesPorCaja || 1)),
            costoDolar: item.esCaja ? item.costoUnitario : (item.costoUnitario * (item.unidadesPorCaja || 1)),
            precioMayor: 0,
            precioMinor: 0,
            empaqueBase: item.esCaja ? 'CAJA' : 'UND',
            unidadesPorEmpaque: item.esCaja ? item.unidadesPorCaja : 1
          });`;

const newBlock2 = `            costoPromedio: item.esCaja ? item.costoUnitario : (item.costoUnitario * (item.unidadesPorCaja || 1)),
            ultimoCosto: item.esCaja ? item.costoUnitario : (item.costoUnitario * (item.unidadesPorCaja || 1)),
            costoDolar: item.esCaja ? item.costoUnitario : (item.costoUnitario * (item.unidadesPorCaja || 1)),
            historialCostos: [{
              id: Math.random().toString(36).substring(2, 9),
              fecha: new Date().toISOString(),
              costo: item.esCaja ? item.costoUnitario : (item.costoUnitario * (item.unidadesPorCaja || 1)),
              proveedorNombre: receivingPurchase.proveedorNombre || 'Desconocido',
              referencia: receivingPurchase.numeroFactura || receivingPurchase.id
            }],
            precioMayor: 0,
            precioMinor: 0,
            empaqueBase: item.esCaja ? 'CAJA' : 'UND',
            unidadesPorEmpaque: item.esCaja ? item.unidadesPorCaja : 1
          });`;

code = code.replace(oldBlock, newBlock);
code = code.replace(oldBlock2, newBlock2);

fs.writeFileSync('src/pages/Compras.tsx', code);
