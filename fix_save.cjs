const fs = require('fs');
let lines = fs.readFileSync('src/pages/Sales.tsx', 'utf8').split('\n');

const start = lines.findIndex(l => l.includes('const handleSaveOrder = () => {'));
const end = lines.findIndex(l => l.includes('const handleCloseSaleSubmit = '));

const newLogic = `  const handleSaveOrder = () => {
    const validItems = orderItems.filter(i => i.codigo && i.cantidad && i.precio);
    if (!orderClient.rif || validItems.length === 0) {
      alert("Por favor, ingrese cliente y al menos un producto.");
      return;
    }

    if (orderClient.rif) {
      const existingClient = clients.find(c => c.rif === orderClient.rif);
      if (!existingClient) {
        const newClient: Client = {
          id: \`CL-\${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}\`,
          tipoCliente: orderClient.tipoCliente || 'V',
          rif: orderClient.rif,
          razonSocial: orderClient.razonSocial || 'CLIENTE NUEVO',
          direccion: orderClient.direccion || '',
          telefono: orderClient.telefono || '',
          tipoPrecio: tipoPrecio,
          credito: condicionPago === 'Crédito',
          diasCredito: 0
        };
        setClients([newClient, ...clients]);
      }
    }

    if (editingSaleId) {
      const updatedSales = sales.map(s => {
        if (s.id === editingSaleId) {
          return {
            ...s,
            clienteId: orderClient.rif || '',
            clienteNombre: orderClient.razonSocial || 'CLIENTE NUEVO',
            tipoUbicacion,
            condicionPago,
            tipoPrecio,
            tipoDocumento,
            total: tipoDocumento === 'Factura' ? validItems.reduce((acc, i) => acc + (i.total || 0), 0) * (1 + (companyConfig.ivaVenta ?? 16) / 100) : validItems.reduce((acc, i) => acc + (i.total || 0), 0),
            items: validItems as SaleItem[],
            tasaAplicada: orderRate
          };
        }
        return s;
      });
      setSales(updatedSales);
      if (selectedSale?.id === editingSaleId) {
        setSelectedSale(updatedSales.find(s => s.id === editingSaleId) || null);
      }
    } else {
      const prefixPrecio = tipoPrecio === 'Mayorista' ? 'MA' : 'MI';
      const prefixPago = condicionPago === 'Contado' ? 'CO' : 'CR';
      const nextIdNumber = sequencesConfig.pedido || 1;
      const generatedId = \`\${prefixPrecio}\${prefixPago}\${nextIdNumber.toString().padStart(5, '0')}\`;
      
      setSequencesConfig(prev => ({ ...prev, pedido: nextIdNumber + 1 }));

      const newSale: Sale = {
        id: generatedId,
        fecha: new Date().toISOString(),
        fechaEstado: new Date().toISOString(),
        auditLog: [{ date: new Date().toISOString(), action: 'Creado', by: userRole?.nombre || 'Sistema', details: '' }],
        clienteId: orderClient.rif || '',
        clienteNombre: orderClient.razonSocial || 'CLIENTE NUEVO',
        estado: 'Registrado/Cotizacion',
        tipoUbicacion,
        condicionPago,
        tipoDocumento,
        tipoPrecio,
        total: tipoDocumento === 'Factura' ? validItems.reduce((acc, i) => acc + (i.total || 0), 0) * (1 + (companyConfig.ivaVenta ?? 16) / 100) : validItems.reduce((acc, i) => acc + (i.total || 0), 0),
        items: validItems as SaleItem[],
        tasaAplicada: orderRate
      };
      setSales([newSale, ...sales]);
    }
    setIsModalOpen(false);
    setEditingSaleId(null);
  };
`;

lines.splice(start, end - start, newLogic);
fs.writeFileSync('src/pages/Sales.tsx', lines.join('\n'));
