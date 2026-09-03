const fs = require('fs');
let lines = fs.readFileSync('src/pages/Sales.tsx', 'utf8').split('\n');

const insertIdx = lines.findIndex(l => l.includes('const advanceStatus = '));

const funcs = `
  const getStatusColor = (status: SaleStatus) => {
    switch(status) {
      case 'Registrado/Cotizacion': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'Confirmado': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Entregado': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Cerrado': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default: return 'text-gray-500 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: SaleStatus) => {
    switch (status) {
      case 'Registrado/Cotizacion': return <FileEdit className="w-3 h-3" />;
      case 'Confirmado': return <Clock className="w-3 h-3" />;
      case 'Entregado': return <Truck className="w-3 h-3" />;
      case 'Cerrado': return <CheckCircle2 className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getNextStatusAction = (sale: Sale) => {
    if (sale.estado === 'Registrado/Cotizacion') return 'Confirmar Pedido';
    if (sale.estado === 'Confirmado' && sale.tipoPrecio === 'Minorista') return 'Cerrar Venta';
    if (sale.estado === 'Confirmado' && sale.tipoPrecio === 'Mayorista') return 'Entregar Venta';
    if (sale.estado === 'Entregado') return 'Cerrar Venta';
    return null;
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate logic
    if (field === 'codigo') {
      const invProduct = inventory.find(p => p.codigo === value);
      if (invProduct) {
        newItems[index].descripcion = invProduct.detalle;
        const isEmp = newItems[index].esEmpaque;
        const hasSecondary = invProduct.tienePrecioSecundario;
        const pPrincipal = tipoPrecio === 'Mayorista' ? (invProduct.precioMayor || 0) : (invProduct.precioMinorista || 0);
        const pSecondary = tipoPrecio === 'Mayorista' ? (invProduct.precioMayorSecundario || 0) : (invProduct.precioMinoristaSecundario || 0);
        let pFinal = pPrincipal;
        if (hasSecondary && !isEmp) pFinal = pSecondary;
        newItems[index].precioUnitario = pFinal;
        newItems[index].cantidad = 1;
        newItems[index].precio = pFinal;
        newItems[index].total = pFinal;
        newItems[index].unidadesPorEmpaque = invProduct.unidadesPorEmpaque || 1;
      }
    }

    if (field === 'cantidad' || field === 'precioUnitario' || field === 'esEmpaque') {
      if (field === 'esEmpaque' && newItems[index].codigo) {
        const invProduct = inventory.find(p => p.codigo === newItems[index].codigo);
        if (invProduct) {
           const isEmp = value;
           const hasSecondary = invProduct.tienePrecioSecundario;
           const pPrincipal = tipoPrecio === 'Mayorista' ? (invProduct.precioMayor || 0) : (invProduct.precioMinorista || 0);
           const pSecondary = tipoPrecio === 'Mayorista' ? (invProduct.precioMayorSecundario || 0) : (invProduct.precioMinoristaSecundario || 0);
           let pFinal = pPrincipal;
           if (hasSecondary && !isEmp) pFinal = pSecondary;
           newItems[index].precioUnitario = pFinal;
        }
      }
      const q = Number(newItems[index].cantidad) || 0;
      const p = Number(newItems[index].precioUnitario) || 0;
      newItems[index].precio = p;
      newItems[index].total = q * p;
    }

    setOrderItems(newItems);
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, {}]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const openNewOrder = () => {
    setEditingSaleId(null);
    setOrderClient({});
    setOrderItems(Array(7).fill({}));
    setTipoUbicacion('Local');
    setCondicionPago('Contado');
    setTipoPrecio('Minorista');
    setTipoDocumento('Nota de Despacho');
    setIsModalOpen(true);
  };

  const handleEditSale = (sale: Sale) => {
    setEditingSaleId(sale.id);
    setOrderClient({ rif: sale.clienteId, razonSocial: sale.clienteNombre });
    setOrderItems(sale.items);
    setTipoUbicacion(sale.tipoUbicacion);
    setCondicionPago(sale.condicionPago);
    setTipoPrecio(sale.tipoPrecio);
    setTipoDocumento(sale.tipoDocumento);
    setIsModalOpen(true);
  };
`;

lines.splice(insertIdx, 0, funcs);
fs.writeFileSync('src/pages/Sales.tsx', lines.join('\n'));

// Also fix the 'by' attribute error on line 279
// error TS2353: Object literal may only specify known properties, and 'by' does not exist
// We just remove `by: userRole?.nombre || 'Sistema', details: ''`
const contents = fs.readFileSync('src/pages/Sales.tsx', 'utf8');
const fixedContents = contents.replace(
  /auditLog: \[\{ date: new Date\(\)\.toISOString\(\), action: 'Creado', by: userRole\?\.nombre \|\| 'Sistema', details: '' \}\]/g,
  "auditLog: [{ date: new Date().toISOString(), action: 'Creado' }]"
);
fs.writeFileSync('src/pages/Sales.tsx', fixedContents);

