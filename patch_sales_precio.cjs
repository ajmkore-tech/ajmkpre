const fs = require('fs');
let code = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

const handleTipoPrecioChange = `  const handleTipoPrecioChange = (newTipoPrecio: 'Mayorista' | 'Minorista') => {
    setTipoPrecio(newTipoPrecio);
    
    if (orderItems.length > 0) {
      setOrderItems(prevItems => prevItems.map(item => {
        if (!item.codigo) return item;
        
        const productData = inventory.find(p => p.codigo === item.codigo);
        if (!productData) return item;

        const hasSecondary = productData.unidadesPorEmpaque && productData.unidadesPorEmpaque > 1;
        
        const precioPrincipal = newTipoPrecio === 'Mayorista' ? (productData.precioMayor || 0) : (productData.precioMinor || 0);
        const precioSecondary = hasSecondary ? (newTipoPrecio === 'Mayorista' ? (productData.precioSecundarioMayor || 0) : (productData.precioSecundarioMinor || 0)) : precioPrincipal;

        const nuevoPrecio = item.esEmpaque ? precioPrincipal : precioSecondary;
        
        return {
          ...item,
          precio: nuevoPrecio,
          total: nuevoPrecio * item.cantidad,
          precioEmpaque: precioPrincipal,
          precioUnidad: precioSecondary
        };
      }));
    }
  };

`;

code = code.replace(
    /const handleProductSelect = \(index: number, productData: any\) => \{/,
    handleTipoPrecioChange + "  const handleProductSelect = (index: number, productData: any) => {"
);

code = code.replace(
    /onClick=\{\(\) => setTipoPrecio\('Minorista'\)\}/g,
    "onClick={() => handleTipoPrecioChange('Minorista')}"
);

code = code.replace(
    /onClick=\{\(\) => setTipoPrecio\('Mayorista'\)\}/g,
    "onClick={() => handleTipoPrecioChange('Mayorista')}"
);

fs.writeFileSync('src/pages/Sales.tsx', code);
