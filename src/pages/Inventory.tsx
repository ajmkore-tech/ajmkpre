import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Search, Download, Upload, Plus, FileEdit, FileText, ArrowRightLeft, X, DollarSign, Package, Save, AlertTriangle, ChevronDown, ChevronUp, ArrowUpDown, Image as ImageIcon, Barcode } from 'lucide-react';
import Papa from 'papaparse';
import ReactBarcode from 'react-barcode';
import { useAppContext } from '../context/AppContext';
import { Product, Movement } from '../types';
import inventoryData from '../data/inventory.json';
import Combobox from '../components/Combobox';

export default function Inventory() {
  const [activeTab, setActiveTab] = useState<'inventario' | 'libro'>('inventario');
  const { inventory, setInventory, userRole, sales, companyConfig } = useAppContext();
  const { inventoryConfig, setInventoryConfig } = useAppContext();
  const [committedProduct, setCommittedProduct] = useState<Product | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [filterCat, setFilterCat] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterMarca, setFilterMarca] = useState('');
  const [filterLinea, setFilterLinea] = useState('');
  const [filterEstatus, setFilterEstatus] = useState('');
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const [selectedProductCode, setSelectedProductCode] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sortConfig, setSortConfig] = useState<{key: keyof Product, direction: 'asc'|'desc'} | null>(null);

  const [packedViewMode, setPackedViewMode] = useState<Record<string, boolean>>({});
  const [viewHistoryProduct, setViewHistoryProduct] = useState<any>(null);
  const togglePackedView = (e: React.MouseEvent, codigo: string) => {
    e.stopPropagation();
    setPackedViewMode(prev => ({...prev, [codigo]: !prev[codigo]}));
  };
  
  const [movements, setMovements] = useState<Movement[]>(() => {
    const saved = localStorage.getItem('app_movements');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem('app_movements', JSON.stringify(movements));
  }, [movements]);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    codigo: '', detalle: '', marcaRepuesto: '', marcaVehiculo: '', linea: '', tipoRepuesto: '', proveedor: '', unidad: 'UND', stockDisp: 0, precioMayor: 0, precioMinor: 0, costoDolar: 0, costoEmpaque: 0, codigoBarras: '', empaqueBase: 'UNIDAD', unidadesPorEmpaque: 1, ventaPorDefecto: 'UND', precioUnidadDetal: 0
  });
  const [adjustForm, setAdjustForm] = useState({
    codigo: '', tipo: 'Entrada', cantidad: 1, motivo: 'Ajuste manual'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { formatBs, activeRate } = useAppContext();

  const handleDownloadTemplate = () => {
    const headers = [
      'Codigo de producto',
      'Detalle',
      'Marca Repuesto',
      'Marca Vehiculo',
      'Linea',
      'Tipo de Repuesto',
      'Proveedor',
      'Unidad',
      'Stock Disp',
      'Stock Comp',
      'Transito',
      'Ult. Costo Dolar',
      'Mayorista USD',
      'Minorista USD'
    ];
    
    const csvContent = Papa.unparse([headers]);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Plantilla_Inventario.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const newProducts: Product[] = results.data.map((row: any) => {
          const codigoRaw = row['Codigo de producto'] || row['CO_ART'] || row['codigo'] || '';
          const detalleRaw = row['Detalle'] || row['ART_DESC'] || row['detalle'] || '';
          
          return {
            id: Math.random().toString(36).substr(2, 9),
            codigo: String(codigoRaw).trim(),
            detalle: String(detalleRaw).trim(),
            marcaRepuesto: String(row['Marca Repuesto'] || row['CO_CAT'] || '').trim().toUpperCase(),
            marcaVehiculo: String(row['Marca Vehiculo'] || row['CO_COLOR'] || '').trim().toUpperCase(),
            linea: String(row['Linea'] || row['CO_LIN'] || '').trim().toUpperCase(),
            tipoRepuesto: String(row['Tipo de Repuesto'] || row['CO_SUBL'] || '').trim().toUpperCase(),
            proveedor: String(row['Proveedor'] || row['CO_PROV'] || '').trim(),
            unidad: String(row['Unidad'] || row['UNI_VENTA'] || 'UND').trim(),
            stockDisp: Number(row['Stock Disp'] || row['STOCK_ACTUAL'] || 0),
            stockComp: Number(row['Stock Comp'] || 0),
            stockTrans: Number(row['Transito'] || 0),
            costoDolar: Number(row['Ult. Costo Dolar'] || row['ULT_COS_DO'] || 0),
            precioMayor: Number(row['Mayorista USD'] || row['PREC_OM'] || 0),
            precioMinor: Number(row['Minorista USD'] || row['PREC_VENTA1'] || 0),
          };
        }).filter(p => p.codigo);

        if (newProducts.length > 0) {
          setInventory([...newProducts, ...inventory]);
        }
        setIsImportModalOpen(false);
      }
    });
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode && selectedProductCode) {
      const updatedInventory = inventory.map(p => {
        if (p.codigo === selectedProductCode) {
          return { ...p, ...(newProduct as Product) };
        }
        return p;
      });
      setInventory(updatedInventory);
      setIsCreateModalOpen(false);
      setIsEditMode(false);
      setNewProduct({codigo: '', detalle: '', marcaRepuesto: '', marcaVehiculo: '', linea: '', tipoRepuesto: '', proveedor: '', unidad: 'UND', stockDisp: 0, precioMayor: 0, precioMinor: 0, costoDolar: 0, costoEmpaque: 0, codigoBarras: '', empaqueBase: 'UNIDAD', unidadesPorEmpaque: 1, ventaPorDefecto: 'UND', precioUnidadDetal: 0});
      return;
    }


    const product: Product = {
      ...(newProduct as Product),
      marcaRepuesto: newProduct.marcaRepuesto?.trim().toUpperCase(),
      marcaVehiculo: newProduct.marcaVehiculo?.trim().toUpperCase(),
      linea: newProduct.linea?.trim().toUpperCase(),
      tipoRepuesto: newProduct.tipoRepuesto?.trim().toUpperCase(),
      id: Math.random().toString(36).substr(2, 9),
      costoPromedio: newProduct.costoPromedio || 0,
      codigoBarras: newProduct.codigoBarras || '',
      empaqueBase: newProduct.empaqueBase || 'UNIDAD',
      unidadesPorEmpaque: newProduct.unidadesPorEmpaque || 1,
      precioUnidadDetal: newProduct.precioUnidadDetal || 0,
      ventaPorDefecto: newProduct.unidadesPorEmpaque > 1 ? (newProduct.ventaPorDefecto || 'UND') : 'UND',
      stockComp: 0, stockTrans: 0
    };
    setInventory([product, ...inventory]);
    
    if (product.stockDisp && product.stockDisp > 0) {
      setMovements([{
        id: Math.random().toString(36).substr(2, 9),
        fecha: new Date().toISOString(),
        codigo: product.codigo,
        detalle: product.detalle,
        tipo: 'Entrada',
        cantidad: Number(product.stockDisp),
        stockAnterior: 0,
        stockNuevo: Number(product.stockDisp),
        motivo: 'Inventario Inicial'
      }, ...movements]);
    }
    setIsCreateModalOpen(false);
    setNewProduct({codigo: '', detalle: '', marcaRepuesto: '', marcaVehiculo: '', linea: '', tipoRepuesto: '', proveedor: '', unidad: 'UND', stockDisp: 0, precioMayor: 0, precioMinor: 0, costoDolar: 0, costoEmpaque: 0, codigoBarras: '', empaqueBase: 'UNIDAD', unidadesPorEmpaque: 1, ventaPorDefecto: 'UND', precioUnidadDetal: 0});
  };

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    const productIndex = inventory.findIndex(p => p.codigo === adjustForm.codigo);
    if (productIndex === -1) {
      alert('Producto no encontrado');
      return;
    }
    
    const product = inventory[productIndex];
    const stockAnterior = product.stockDisp;
    const qty = Number(adjustForm.cantidad);
    const stockNuevo = adjustForm.tipo === 'Entrada' ? stockAnterior + qty : stockAnterior - qty;
    
    if (stockNuevo < 0) {
      alert('El stock no puede ser negativo');
      return;
    }
    
    const updatedInventory = [...inventory];
    updatedInventory[productIndex] = { ...product, stockDisp: stockNuevo, stockTotal: stockNuevo };
    setInventory(updatedInventory);
    
    setMovements([{
      id: Math.random().toString(36).substr(2, 9),
      fecha: new Date().toISOString(),
      codigo: product.codigo,
      detalle: product.detalle,
      tipo: adjustForm.tipo as 'Entrada' | 'Salida',
      cantidad: qty,
      stockAnterior,
      stockNuevo,
      motivo: adjustForm.motivo
    }, ...movements]);
    
    setIsAdjustModalOpen(false);
    setAdjustForm({ codigo: '', tipo: 'Entrada', cantidad: 1, motivo: 'Ajuste manual' });
  };

  // Derive filter options dynamically
  const categories = useMemo(() => Array.from(new Set([...(inventoryConfig?.marcasRepuesto || []), ...inventory.map(i => i.marcaRepuesto)])).filter(Boolean).sort(), [inventory, inventoryConfig]);
  const tipos = useMemo(() => Array.from(new Set([...(inventoryConfig?.tiposRepuesto || []), ...inventory.map(i => i.tipoRepuesto)])).filter(Boolean).sort(), [inventory, inventoryConfig]);
  const marcas = useMemo(() => Array.from(new Set([...(inventoryConfig?.marcasVehiculo || []), ...inventory.map(i => i.marcaVehiculo)])).filter(Boolean).sort(), [inventory, inventoryConfig]);
  const lineas = useMemo(() => Array.from(new Set([...(inventoryConfig?.lineas || []), ...inventory.map(i => i.linea)])).filter(Boolean).sort(), [inventory, inventoryConfig]);
  const proveedores = useMemo(() => Array.from(new Set(inventory.map(i => i.proveedor))), [inventory]);
  const codigos = useMemo(() => Array.from(new Set(inventory.map(i => i.codigo))), [inventory]);

  const duplicateWarning = useMemo(() => {
    if (isEditMode) return null;
    if (!newProduct.codigo && !newProduct.detalle) return null;
    
    const codeMatch = newProduct.codigo 
      ? inventory.find(p => p.codigo.toLowerCase() === newProduct.codigo?.toLowerCase())
      : undefined;
    
    let similarProducts: Product[] = [];
    if (newProduct.detalle && newProduct.detalle.length > 4) {
      const inputStr = newProduct.detalle.toLowerCase().trim();
      similarProducts = inventory.filter(p => {
        if (p.codigo === codeMatch?.codigo) return false;
        const targetStr = p.detalle.toLowerCase();
        return targetStr.includes(inputStr) || inputStr.includes(targetStr);
      }).slice(0, 3);
    }

    if (codeMatch || similarProducts.length > 0) {
      return { codeMatch, similarProducts };
    }
    return null;
  }, [newProduct.codigo, newProduct.detalle, inventory, isEditMode]);

  const normalizeSearch = (str?: string) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const searchNormalized = normalizeSearch(searchTerm);
      const matchSearch = !searchTerm || 
                          normalizeSearch(item.detalle).includes(searchNormalized) ||
                          normalizeSearch(item.codigo).includes(searchNormalized) ||
                          normalizeSearch(item.marcaRepuesto).includes(searchNormalized) ||
                          normalizeSearch(item.marcaVehiculo).includes(searchNormalized) ||
                          normalizeSearch(item.linea).includes(searchNormalized);
      const matchCat = filterCat ? item.marcaRepuesto === filterCat : true;
      const matchTipo = filterTipo ? item.tipoRepuesto === filterTipo : true;
      const matchMarca = filterMarca ? item.marcaVehiculo === filterMarca : true;
      const matchLinea = filterLinea ? item.linea === filterLinea : true;
      
      let matchEstatus = true;
      if (filterEstatus === 'Disponible') matchEstatus = item.stockDisp > 0;
      if (filterEstatus === 'Agotado') matchEstatus = item.stockDisp <= 0;
      
      return matchSearch && matchCat && matchTipo && matchMarca && matchLinea && matchEstatus;
    });
  }, [inventory, searchTerm, filterCat, filterTipo, filterMarca, filterLinea, filterEstatus]);

  const sortedInventory = useMemo(() => {
    let sortableItems = [...filteredInventory];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredInventory, sortConfig]);

  const handleSort = (key: keyof Product) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const displayedInventory = useMemo(() => {
    const isFiltering = searchTerm || filterCat || filterTipo || filterMarca || filterLinea || filterEstatus;
    return isFiltering ? sortedInventory : sortedInventory.slice(0, 100);
  }, [sortedInventory, searchTerm, filterCat, filterTipo, filterMarca, filterLinea, filterEstatus]);

  const SortIcon = ({ columnKey }: { columnKey: keyof Product }) => {
    if (sortConfig?.key === columnKey) {
      return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 inline-block ml-1" /> : <ChevronDown className="w-3 h-3 inline-block ml-1" />;
    }
    return <ArrowUpDown className="w-3 h-3 inline-block ml-1 opacity-20 group-hover:opacity-100 transition-opacity" />;
  };

  const [editingPrice, setEditingPrice] = useState<'mayor' | 'minor' | 'stock' | null>(null);
  const [tempPriceVal, setTempPriceVal] = useState<string>('');

  const selectedProduct = useMemo(() => inventory.find(p => p.codigo === selectedProductCode), [inventory, selectedProductCode]);

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    // Buscar productos similares por código (primeros 3 caracteres) o por la misma categoría
    const prefix = selectedProduct.codigo.substring(0, 3);
    return inventory.filter(p => p.id !== selectedProduct.id && (p.codigo.startsWith(prefix) || p.marcaRepuesto === selectedProduct.marcaRepuesto)).slice(0, 3);
  }, [selectedProduct, inventory]);

  const handlePriceInlineSave = () => {
    if (!selectedProduct || !editingPrice) return;
    const newPrice = Number(tempPriceVal);
    if (!isNaN(newPrice) && newPrice >= 0) {
      const updatedInventory = inventory.map(p => {
        if (p.id === selectedProduct.id) {
          const field = editingPrice === 'mayor' ? 'precioMayor' : (editingPrice === 'minor' ? 'precioMinor' : 'stockDisp');
          return { ...p, [field]: newPrice };
        }
        return p;
      });
      setInventory(updatedInventory);
      
    }
    setEditingPrice(null);
  };

  return (
    <div className="h-full flex flex-col bg-transparent relative">
      <div className="px-4 py-3 flex items-center justify-between shrink-0 border-b border-gray-200/60 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center shadow shadow-blue-500/30 shrink-0">
            <Package className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-[#0B1120] font-montserrat tracking-tight leading-none">Inventarios</h2>
            <p className="text-[10px] text-gray-500 font-medium mt-1">Gestión de existencias</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 p-1 bg-white border border-gray-200 rounded-lg shadow-sm mr-1">
            <button 
              className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-colors ${activeTab === 'inventario' ? 'bg-[#F8FAFC] text-[#0B1120] shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-700'}`}
              onClick={() => setActiveTab('inventario')}
            >
              Maestro
            </button>
            <button 
              className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-colors ${activeTab === 'libro' ? 'bg-[#F8FAFC] text-[#0B1120] shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-700'}`}
              onClick={() => setActiveTab('libro')}
            >
              Kárdex
            </button>
          </div>
          <button onClick={() => {
            setAdjustForm({ codigo: selectedProductCode || '', tipo: 'Entrada', cantidad: 1, motivo: 'Ajuste manual' });
            setIsAdjustModalOpen(true);
          }} className="bg-white text-[#0B1120] border border-gray-200 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:bg-gray-50 transition-colors shadow-sm">
            <ArrowRightLeft className="w-3 h-3" /> Ajuste
          </button>
          <button 
            disabled={!selectedProductCode}
            onClick={() => {
              if (selectedProduct) {
                setNewProduct({
                  ...selectedProduct,
                  costoEmpaque: selectedProduct.costoEmpaque || Number((selectedProduct.costoDolar * (selectedProduct.unidadesPorEmpaque || 1)).toFixed(2))
                });
                setIsEditMode(true);
                setIsCreateModalOpen(true);
              }
            }} 
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-sm ${selectedProductCode ? 'bg-white text-[#0B1120] border border-gray-200 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 border border-transparent cursor-not-allowed'}`}
          >
            <FileEdit className="w-3 h-3" /> Editar
          </button>
          <button onClick={() => {
            setNewProduct({codigo: '', detalle: '', marcaRepuesto: '', marcaVehiculo: '', linea: '', tipoRepuesto: '', proveedor: '', unidad: 'UND', stockDisp: 0, precioMayor: 0, precioMinor: 0, costoDolar: 0, costoEmpaque: 0, codigoBarras: '', empaqueBase: 'UNIDAD', unidadesPorEmpaque: 1, ventaPorDefecto: 'UND', precioUnidadDetal: 0});
            setIsEditMode(false);
            setIsCreateModalOpen(true);
          }} className="bg-[#2563EB] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20 font-montserrat uppercase tracking-wider">
            <Plus className="w-3 h-3" /> Registrar
          </button>
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col gap-3 flex-1 overflow-hidden">
        <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-200 shrink-0">
          <div className="flex gap-2 mb-2.5">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 opacity-40" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-[11px] bg-gray-50/50 focus:outline-none focus:ring-1 focus:ring-[#2563EB]/20 transition-all"
                placeholder="Buscar por código o detalle..."
              />
            </div>
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold flex items-center gap-1.5 text-[#0B1120] hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" /> Importar
            </button>
            <button className="px-3 py-1.5 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:bg-[#10B981]/20 transition-colors shadow-sm">
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="text-[10px] font-medium p-1.5 border border-gray-200 rounded-md bg-white text-gray-700 focus:ring-1 focus:ring-[#2563EB]/20 outline-none shadow-sm">
              <option value="">Marcas Repuesto</option>
              {categories.map((c, idx) => <option key={`cat-${idx}`} value={c}>{c}</option>)}
            </select>
            <select value={filterMarca} onChange={e => setFilterMarca(e.target.value)} className="text-[10px] font-medium p-1.5 border border-gray-200 rounded-md bg-white text-gray-700 focus:ring-1 focus:ring-[#2563EB]/20 outline-none shadow-sm">
              <option value="">Marcas Vehículo</option>
              {marcas.map((m, idx) => <option key={`mar-${idx}`} value={m}>{m}</option>)}
            </select>
            <select value={filterLinea} onChange={e => setFilterLinea(e.target.value)} className="text-[10px] font-medium p-1.5 border border-gray-200 rounded-md bg-white text-gray-700 focus:ring-1 focus:ring-[#2563EB]/20 outline-none shadow-sm">
              <option value="">Todas las Líneas</option>
              {lineas.map((l, idx) => <option key={`lin-${idx}`} value={l}>{l}</option>)}
            </select>
            <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} className="text-[10px] font-medium p-1.5 border border-gray-200 rounded-md bg-white text-gray-700 focus:ring-1 focus:ring-[#2563EB]/20 outline-none shadow-sm">
              <option value="">Tipos Repuesto</option>
              {tipos.map((t, idx) => <option key={`tip-${idx}`} value={t}>{t}</option>)}
            </select>
            <select value={filterEstatus} onChange={e => setFilterEstatus(e.target.value)} className="text-[10px] font-medium p-1.5 border border-gray-200 rounded-md bg-white text-gray-700 focus:ring-1 focus:ring-[#2563EB]/20 outline-none shadow-sm">
              <option value="">Cualquier Estatus</option>
              <option value="Disponible">Disponible (Stock &gt; 0)</option>
              <option value="Agotado">Agotado (Stock = 0)</option>
            </select>
          </div>
        </div>

        <div className="bg-white flex-1 rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-0 relative">
          <div className="overflow-auto flex-1 custom-scrollbar">
            {activeTab === 'inventario' ? (
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="bg-[#F8FAFC] border-b border-gray-200 text-[#0B1120] text-[9px] uppercase tracking-wider sticky top-0 z-10 font-montserrat">
                <tr>
                  <th className="px-1 py-2 font-bold w-[12%] cursor-pointer hover:bg-gray-100 group" onClick={() => handleSort('codigo')}>Código <SortIcon columnKey="codigo" /></th>
                  <th className="px-1 py-2 font-bold w-[25%] cursor-pointer hover:bg-gray-100 group" onClick={() => handleSort('detalle')}>Detalle <SortIcon columnKey="detalle" /></th>
                  <th className="px-1 py-2 font-bold w-[8%] cursor-pointer hover:bg-gray-100 group" onClick={() => handleSort('marcaRepuesto')}>Marca <SortIcon columnKey="marcaRepuesto" /></th>
                  <th className="px-1 py-2 font-bold w-[9%] cursor-pointer hover:bg-gray-100 group" onClick={() => handleSort('marcaVehiculo')}>Vehíc. <SortIcon columnKey="marcaVehiculo" /></th>
                  <th className="px-1 py-2 font-bold w-[8%] cursor-pointer hover:bg-gray-100 group" onClick={() => handleSort('linea')}>Línea <SortIcon columnKey="linea" /></th>
                  <th className="px-1 py-2 font-bold w-[8%] cursor-pointer hover:bg-gray-100 group" onClick={() => handleSort('tipoRepuesto')}>Tipo <SortIcon columnKey="tipoRepuesto" /></th>
                  <th className="px-1 py-2 font-bold w-[4%]">Und</th>
                  <th className="px-1 py-2 font-bold text-center cursor-pointer hover:bg-gray-100 group w-[5%]" onClick={() => handleSort('stockDisp')}>Disp. <SortIcon columnKey="stockDisp" /></th>
                  <th className="px-1 py-2 font-bold text-center cursor-pointer hover:bg-gray-100 group w-[5%]" onClick={() => handleSort('stockComp')}>Comp. <SortIcon columnKey="stockComp" /></th>
                  <th className="px-1 py-2 font-bold text-center cursor-pointer hover:bg-gray-100 group w-[4%]" onClick={() => handleSort('stockTrans')}>Trán. <SortIcon columnKey="stockTrans" /></th>
                  <th className="px-1 py-2 font-bold text-right cursor-pointer hover:bg-gray-100 group w-[6%]" onClick={() => handleSort('precioMayor')}>Mayor($) <SortIcon columnKey="precioMayor" /></th>
                  <th className="px-1 py-2 font-bold text-right cursor-pointer hover:bg-gray-100 group w-[6%]" onClick={() => handleSort('precioMinor')}>Minor($) <SortIcon columnKey="precioMinor" /></th>
                </tr>
              </thead>
              <tbody className="text-[9px] text-[#0F172A] divide-y divide-gray-100">
                {displayedInventory.length > 0 ? (
                  displayedInventory.map((item) => (
                    <tr 
                      key={item.id} 
                      onClick={() => {
                        setSelectedProductCode(item.codigo);
                        setIsDetailModalOpen(true);
                      }}
                      className={`cursor-pointer transition-colors group ${selectedProductCode === item.codigo ? 'bg-blue-50/80 border-l-2 border-blue-500' : 'hover:bg-blue-50/50'}`}
                    >
                      <td className={`px-1 py-1.5 font-mono font-bold truncate ${selectedProductCode === item.codigo ? 'text-blue-800' : 'text-[#2563EB]'}`} title={item.codigo}>{item.codigo}</td>
                      <td className="px-1 py-1.5 font-medium truncate leading-tight" title={item.detalle}>{item.detalle}</td>
                      <td className="px-1 py-1.5 truncate text-gray-500 leading-tight" title={item.marcaRepuesto}>{item.marcaRepuesto}</td>
                      <td className="px-1 py-1.5 truncate text-gray-500 leading-tight" title={item.marcaVehiculo}>{item.marcaVehiculo}</td>
                      <td className="px-1 py-1.5 truncate text-gray-500 leading-tight" title={item.linea}>{item.linea}</td>
                      <td className="px-1 py-1.5 truncate text-gray-500 leading-tight" title={item.tipoRepuesto}>{item.tipoRepuesto}</td>
                      <td 
                        className={`px-1 py-1.5 truncate ${item.unidadesPorEmpaque > 1 ? 'cursor-pointer hover:text-[#2563EB] text-[#2563EB] font-medium' : 'text-gray-500'}`}
                        onClick={(e) => { if(item.unidadesPorEmpaque > 1) togglePackedView(e, item.codigo); }}
                        title={item.unidadesPorEmpaque > 1 ? "Clic para cambiar unidad de vista" : ""}
                      >
                        {packedViewMode[item.codigo] && item.unidadesPorEmpaque > 1 ? item.empaqueBase : item.unidad}
                      </td>
                      <td className="px-1 py-1.5 text-center">
                        <div 
                          className={`flex flex-col items-center justify-center ${item.unidadesPorEmpaque > 1 ? 'cursor-pointer' : ''}`}
                          onClick={(e) => { if(item.unidadesPorEmpaque > 1) togglePackedView(e, item.codigo); }}
                          title={item.unidadesPorEmpaque > 1 ? "Clic para alternar vista (Total / Cajas)" : ""}
                        >
                          {packedViewMode[item.codigo] && item.unidadesPorEmpaque > 1 ? (
                            <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] whitespace-nowrap ${item.stockDisp > 0 ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'bg-red-50 text-red-600'} hover:bg-[#2563EB]/20 transition-colors`}>
                              {Number((item.stockDisp * item.unidadesPorEmpaque).toFixed(2))}
                            </span>
                          ) : (
                            <span className={`px-1 py-0.5 rounded font-bold ${item.stockDisp > 0 ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'bg-red-50 text-red-600'} hover:bg-[#2563EB]/20 transition-colors`}>
                              {Number(item.stockDisp.toFixed(2))}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-1 py-1.5 text-center">
                        <span 
                          onClick={(e) => { e.stopPropagation(); if(item.stockComp > 0) setCommittedProduct(item); }}
                          className={`${item.stockComp > 0 ? 'cursor-pointer hover:bg-orange-100' : ''} text-orange-600 font-bold bg-orange-50 px-1 py-0.5 rounded transition-colors`}
                          title={item.stockComp > 0 ? "Ver detalles de pedidos confirmados" : ""}
                        >
                          {packedViewMode[item.codigo] && item.unidadesPorEmpaque > 1 ? Number((item.stockComp * item.unidadesPorEmpaque).toFixed(2)) : item.stockComp}
                        </span>
                      </td>
                      <td className="px-1 py-1.5 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-purple-600 font-bold bg-purple-50 px-1 py-0.5 rounded">
                            {packedViewMode[item.codigo] && item.unidadesPorEmpaque > 1 ? Number((item.stockTrans * item.unidadesPorEmpaque).toFixed(2)) : item.stockTrans}
                          </span>
                        </div>
                      </td>
                      <td className="px-1 py-1.5 text-right truncate">
                        <div className="font-bold flex items-center justify-end"><DollarSign className="w-2.5 h-2.5 text-gray-400"/> 
                          {packedViewMode[item.codigo] && item.unidadesPorEmpaque > 1 
                            ? (item.precioSecundarioMayor ? item.precioSecundarioMayor.toFixed(2) : 'S/P') 
                            : (item.precioMayor ? item.precioMayor.toFixed(2) : 'S/P')}
                        </div>
                        <div className="text-[8px] text-gray-400 font-normal">
                          {packedViewMode[item.codigo] && item.unidadesPorEmpaque > 1 
                            ? (item.precioSecundarioMayor ? formatBs(item.precioSecundarioMayor) : 'S/P')
                            : (item.precioMayor ? formatBs(item.precioMayor) : 'S/P')}
                        </div>
                      </td>
                      <td className="px-1 py-1.5 text-right truncate">
                        <div className="font-bold flex items-center justify-end"><DollarSign className="w-2.5 h-2.5 text-gray-400"/> 
                          {packedViewMode[item.codigo] && item.unidadesPorEmpaque > 1 
                            ? (item.precioSecundarioMinor ? item.precioSecundarioMinor.toFixed(2) : 'S/P') 
                            : (item.precioMinor ? item.precioMinor.toFixed(2) : 'S/P')}
                        </div>
                        <div className="text-[8px] text-gray-400 font-normal">
                          {packedViewMode[item.codigo] && item.unidadesPorEmpaque > 1 
                            ? (item.precioSecundarioMinor ? formatBs(item.precioSecundarioMinor) : 'S/P')
                            : (item.precioMinor ? formatBs(item.precioMinor) : 'S/P')}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="px-4 py-8 text-center text-gray-400 text-xs">
                      No se encontraron resultados para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            ) : (
              <table className="w-full text-left border-collapse min-w-max">
                <thead className="bg-[#F8FAFC] border-b border-gray-200 text-[#0B1120] text-[9px] uppercase tracking-wider sticky top-0 z-10 font-montserrat">
                  <tr>
                    <th className="px-3 py-2 font-bold">Fecha y Hora</th>
                    <th className="px-3 py-2 font-bold">Código</th>
                    <th className="px-3 py-2 font-bold w-[30%]">Detalle</th>
                    <th className="px-3 py-2 font-bold text-center">Tipo</th>
                    <th className="px-3 py-2 font-bold text-center">Cant.</th>
                    <th className="px-3 py-2 font-bold text-center">Stock Ant.</th>
                    <th className="px-3 py-2 font-bold text-center">Stock Nvo.</th>
                    <th className="px-3 py-2 font-bold">Motivo</th>
                  </tr>
                </thead>
                <tbody className="text-[10px] text-[#0F172A] divide-y divide-gray-100">
                  {movements.length > 0 ? movements.map(m => (
                     <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                       <td className="px-3 py-2 whitespace-nowrap">{new Date(m.fecha).toLocaleString()}</td>
                       <td className="px-3 py-2 font-mono font-bold text-[#2563EB]">{m.codigo}</td>
                       <td className="px-3 py-2 font-medium">{m.detalle}</td>
                       <td className="px-3 py-2 text-center">
                         <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider ${m.tipo === 'Entrada' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-red-50 text-red-600'}`}>{m.tipo}</span>
                       </td>
                       <td className="px-3 py-2 text-center font-bold">{m.cantidad}</td>
                       <td className="px-3 py-2 text-center text-gray-500">{m.stockAnterior}</td>
                       <td className="px-3 py-2 text-center font-bold text-[#0B1120]">{m.stockNuevo}</td>
                       <td className="px-3 py-2 text-gray-500">{m.motivo}</td>
                     </tr>
                  )) : (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No hay movimientos registrados. Genera un ajuste o crea un producto para ver el historial.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="p-2 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500 shrink-0">
            <div className="font-medium">Mostrando {displayedInventory.length} resultados {displayedInventory.length < sortedInventory.length ? `(de ${sortedInventory.length})` : ''}</div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      
      {viewHistoryProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="font-black text-[#0B1120] uppercase tracking-wider text-sm">Historial de Costos</h3>
                <p className="text-xs font-medium text-gray-500 mt-0.5">{viewHistoryProduct.detalle}</p>
              </div>
              <button onClick={() => setViewHistoryProduct(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh] custom-scrollbar">
              {(!viewHistoryProduct.historialCostos || viewHistoryProduct.historialCostos.length === 0) ? (
                <div className="text-center text-sm font-medium text-gray-500 py-8">No hay historial registrado.</div>
              ) : (
                <div className="space-y-3">
                  {viewHistoryProduct.historialCostos.map((hist: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div>
                        <div className="text-xs font-bold text-[#0B1120] mb-0.5">{hist.proveedorNombre}</div>
                        <div className="text-[10px] font-medium text-gray-500">Ref: {hist.referencia} • {new Date(hist.fecha).toLocaleDateString()}</div>
                      </div>
                      <div className="text-sm font-black text-[#2563EB] bg-blue-50 px-2 py-1 rounded">
                        ${hist.costo.toFixed(3)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isImportModalOpen && (
        <div className="absolute inset-0 bg-[#0B1120]/40 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm relative border border-gray-100">
            <button 
              onClick={() => setIsImportModalOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 p-1 rounded-full transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
            <h2 className="text-lg font-black text-[#0B1120] mb-1 font-montserrat tracking-tight">Importar Inventario</h2>
            <p className="text-[10px] text-gray-500 mb-4 font-medium">Selecciona un archivo TXT separado por "|" o CSV.</p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDownloadTemplate}
                className="w-full py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" /> Descargar Plantilla Excel (CSV)
              </button>
              
              <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-[#F8FAFC] hover:border-[#2563EB]/50 transition-colors cursor-pointer group"
                   onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-[#2563EB] mx-auto mb-2 transition-colors" />
                <p className="text-xs font-bold text-[#0B1120]">Subir archivo lleno</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImport} 
                accept=".csv,.txt" 
                className="hidden" 
              />
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {isCreateModalOpen && (
        <div className="absolute inset-0 bg-[#0B1120]/40 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-black text-[#0B1120] font-montserrat tracking-tight">{isEditMode ? 'Editar Producto' : 'Registrar Nuevo Producto'}</h2>
              <button onClick={() => { setIsCreateModalOpen(false); setIsEditMode(false); }} className="text-gray-400 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 overflow-y-auto custom-scrollbar">
              {duplicateWarning && (
                <div className={`mb-4 p-3 rounded-lg border text-xs ${duplicateWarning.codeMatch ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${duplicateWarning.codeMatch ? 'text-red-600' : 'text-amber-600'}`} />
                    <div>
                      {duplicateWarning.codeMatch && (
                        <div className="font-bold mb-1">
                          ¡Alerta! El código "{duplicateWarning.codeMatch.codigo}" ya existe ({duplicateWarning.codeMatch.detalle}). No se puede duplicar.
                        </div>
                      )}
                      {duplicateWarning.similarProducts.length > 0 && (
                        <div>
                          <span className="font-bold">Productos con descripción similar encontrados:</span>
                          <ul className="list-disc pl-4 mt-1 opacity-90">
                            {duplicateWarning.similarProducts.map(p => (
                              <li key={p.codigo}>{p.codigo} - {p.detalle}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <form id="create-form" onSubmit={handleCreateProduct} className="flex flex-col gap-6">
                
                {/* SECCION 1: PRESENTACION */}
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 mb-2 border-b border-gray-200 pb-2">
                    <h3 className="text-sm font-bold text-[#0B1120]">1. Identificación</h3>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Código</label>
                    <Combobox 
                      value={newProduct.codigo || ''} 
                      onChange={val => setNewProduct({...newProduct, codigo: val})} 
                      options={codigos}
                      required 
                      className={`w-full p-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-2 transition-all ${duplicateWarning?.codeMatch && !isEditMode ? 'border-red-300 focus:ring-red-500/20' : 'border-gray-200 focus:ring-[#2563EB]/20'}`} 
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Código de Barras</label>
                    <input type="text" value={newProduct.codigoBarras || ''} onChange={e => setNewProduct({...newProduct, codigoBarras: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all" placeholder="Ej: 7591234567890" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Descripción</label>
                    <input required type="text" value={newProduct.detalle} onChange={e => setNewProduct({...newProduct, detalle: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Marca Repuesto</label>
                    <Combobox value={newProduct.marcaRepuesto || ''} onChange={val => setNewProduct({...newProduct, marcaRepuesto: val})} options={categories} className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Marca Vehículo</label>
                    <Combobox value={newProduct.marcaVehiculo || ''} onChange={val => setNewProduct({...newProduct, marcaVehiculo: val})} options={marcas} className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Línea</label>
                    <Combobox value={newProduct.linea || ''} onChange={val => setNewProduct({...newProduct, linea: val})} options={lineas} className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Tipo de Repuesto</label>
                    <Combobox value={newProduct.tipoRepuesto || ''} onChange={val => setNewProduct({...newProduct, tipoRepuesto: val})} options={[]} className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none" />
                  </div>
                </div>

                {/* SECCION 2: EMPAQUE Y COSTOS */}
                <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                  <div className="col-span-1 md:col-span-3 mb-2 border-b border-blue-100 pb-2 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-[#0B1120]">2. Configuración de Unidades y Costos</h3>
                  </div>

                  {/* EMPAQUE PRINCIPAL */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Unidad Principal</label>
                      <select 
                        value={newProduct.unidad || 'CAJA'} 
                        onChange={e => setNewProduct({...newProduct, unidad: e.target.value})} 
                        className="w-full p-2 border border-gray-200 rounded-lg text-xs font-bold bg-gray-50 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                      >
                        {(companyConfig?.packagingTypes || ['CAJA', 'UND', 'BLT', 'JGO', 'SET', 'PQT', 'PAR']).map(pkg => (
                          <option key={pkg} value={pkg}>{pkg}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center mt-4">
                      <label className="flex items-center cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={newProduct.unidadesPorEmpaque > 1}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewProduct({ ...newProduct, unidadesPorEmpaque: 2, empaqueBase: 'PIEZA' });
                            } else {
                              setNewProduct({ ...newProduct, unidadesPorEmpaque: 1, empaqueBase: undefined, precioSecundarioMayor: 0, precioSecundarioMinor: 0 });
                            }
                          }}
                          className="w-4 h-4 text-[#2563EB] bg-gray-100 border-gray-300 rounded focus:ring-[#2563EB] cursor-pointer"
                        />
                        <span className="ml-2 text-xs font-bold text-gray-700 uppercase tracking-wide group-hover:text-[#2563EB] transition-colors">
                          Lleva unidad secundaria
                        </span>
                      </label>
                    </div>

                    {newProduct.unidadesPorEmpaque > 1 && (
                      <div className="flex gap-2">
                        <div className="w-1/2">
                          <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">¿Cuántas?</label>
                          <input 
                            type="number" min="2" 
                            value={newProduct.unidadesPorEmpaque || ''} 
                            onChange={e => {
                              const val = Math.max(2, parseInt(e.target.value) || 2);
                              setNewProduct({
                                ...newProduct, 
                                unidadesPorEmpaque: val,
                                costoDolar: Number(((newProduct.costoEmpaque || 0) / val).toFixed(2)) // Auto calc secondary cost
                              });
                            }} 
                            className="w-full p-2 border border-gray-200 rounded-lg text-xs font-bold text-[#2563EB] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20" 
                          />
                        </div>
                        <div className="w-1/2">
                          <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Secundaria</label>
                          <select 
                            value={newProduct.empaqueBase || 'PIEZA'} 
                            onChange={e => setNewProduct({...newProduct, empaqueBase: e.target.value})} 
                            className="w-full p-2 border border-gray-200 rounded-lg text-xs font-bold bg-gray-50 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                          >
                            {(companyConfig?.packagingTypes || ['CAJA', 'UND', 'BLT', 'JGO', 'SET', 'PQT', 'PAR']).map(pkg => (
                              <option key={pkg} value={pkg}>{pkg}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                    
                    {!isEditMode && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                        Stock Inicial (en {newProduct.unidad || 'CAJA'}s)
                      </label>
                      <input 
                        type="number" min="0" step="0.01"
                        value={newProduct.stockDisp !== undefined ? newProduct.stockDisp : ''}
                        onChange={e => {
                          const val = Number(e.target.value) || 0;
                          setNewProduct({...newProduct, stockDisp: val});
                        }} 
                        className="w-full p-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 bg-gray-50 focus:bg-white focus:outline-none" 
                      />
                      {newProduct.unidadesPorEmpaque > 1 && newProduct.stockDisp > 0 && (
                        <div className="text-[9px] text-gray-400 mt-1 font-bold">
                          = {Math.floor(newProduct.stockDisp * newProduct.unidadesPorEmpaque)} {newProduct.empaqueBase}s
                        </div>
                      )}
                    </div>
                    )}
                  </div>

                  {/* COSTOS */}
                  <div className={`col-span-1 md:col-span-3 grid grid-cols-1 ${newProduct.unidadesPorEmpaque > 1 ? 'sm:grid-cols-2' : ''} gap-4`}>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                        Costo de {newProduct.unidad || 'CAJA'} (USD)
                      </label>
                      <input 
                        type="number" step="0.01" min="0" required
                        value={newProduct.costoEmpaque || ''} 
                        onChange={e => {
                          const val = Number(e.target.value);
                          const divisor = newProduct.unidadesPorEmpaque || 1;
                          setNewProduct({
                            ...newProduct, 
                            costoEmpaque: val,
                            costoDolar: Number((val / divisor).toFixed(2)) 
                          });
                        }} 
                        className={`w-full p-2 border border-gray-200 rounded-lg text-xs font-bold ${!userRole.permissions.inventario.editarCostos ? 'text-gray-500 bg-gray-100 cursor-not-allowed' : 'text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20'}`} 
                      />
                    </div>

                    {newProduct.unidadesPorEmpaque > 1 && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">
                        Costo de {newProduct.empaqueBase || 'PIEZA'} (USD) (Calculado)
                      </label>
                      <input 
                        type="number" step="0.001" min="0" disabled
                        value={newProduct.costoDolar || ''} 
                        className="w-full p-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 bg-gray-100 cursor-not-allowed" 
                      />
                    </div>
                    )}
                  </div>
                </div>

                {/* SECCION 3: PRECIOS Y RENTABILIDAD */}
                <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2 mb-2 border-b border-emerald-100 pb-2">
                    <h3 className="text-sm font-bold text-[#0B1120]">3. Precios de Venta</h3>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-sm col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2">
                      <h4 className="text-xs font-bold text-emerald-800 mb-2 uppercase border-b border-emerald-50 pb-1">Precios por {newProduct.unidad || 'CAJA'}</h4>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">Precio Mayorista</label>
                        <span className="text-[10px] font-bold text-emerald-600">
                          Mg: {newProduct.costoEmpaque && newProduct.precioMayor ? (((newProduct.precioMayor - newProduct.costoEmpaque) / newProduct.costoEmpaque) * 100).toFixed(0) : '0'}%
                        </span>
                      </div>
                      <input 
                        required type="number" step="0.01" min="0"
                        value={newProduct.precioMayor || ''} 
                        onChange={e => setNewProduct({...newProduct, precioMayor: Number(e.target.value)})} 
                        className="w-full p-2 border border-emerald-200 rounded-lg text-xs font-black text-emerald-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">Precio Minorista</label>
                        <span className="text-[10px] font-bold text-emerald-600">
                          Mg: {newProduct.costoEmpaque && newProduct.precioMinor ? (((newProduct.precioMinor - newProduct.costoEmpaque) / newProduct.costoEmpaque) * 100).toFixed(0) : '0'}%
                        </span>
                      </div>
                      <input 
                        required type="number" step="0.01" min="0"
                        value={newProduct.precioMinor || ''} 
                        onChange={e => setNewProduct({...newProduct, precioMinor: Number(e.target.value)})} 
                        className="w-full p-2 border border-emerald-200 rounded-lg text-xs font-black text-emerald-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                      />
                    </div>

                    {newProduct.unidadesPorEmpaque > 1 && (
                      <>
                        <div className="col-span-1 sm:col-span-2 mt-2 pt-2 border-t border-emerald-50">
                          <h4 className="text-xs font-bold text-emerald-800 mb-2 uppercase border-b border-emerald-50 pb-1">Precios por {newProduct.empaqueBase || 'PIEZA'}</h4>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">Precio Mayorista (Secundaria)</label>
                            <span className="text-[10px] font-bold text-emerald-600">
                              Mg: {newProduct.costoDolar && newProduct.precioSecundarioMayor ? (((newProduct.precioSecundarioMayor - newProduct.costoDolar) / newProduct.costoDolar) * 100).toFixed(0) : '0'}%
                            </span>
                          </div>
                          <input 
                            type="number" step="0.01" min="0"
                            value={newProduct.precioSecundarioMayor || ''} 
                            onChange={e => setNewProduct({...newProduct, precioSecundarioMayor: Number(e.target.value)})} 
                            className="w-full p-2 border border-emerald-200 rounded-lg text-xs font-black text-emerald-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">Precio Minorista (Secundaria)</label>
                            <span className="text-[10px] font-bold text-emerald-600">
                              Mg: {newProduct.costoDolar && newProduct.precioSecundarioMinor ? (((newProduct.precioSecundarioMinor - newProduct.costoDolar) / newProduct.costoDolar) * 100).toFixed(0) : '0'}%
                            </span>
                          </div>
                          <input 
                            type="number" step="0.01" min="0"
                            value={newProduct.precioSecundarioMinor || ''} 
                            onChange={e => setNewProduct({...newProduct, precioSecundarioMinor: Number(e.target.value)})} 
                            className="w-full p-2 border border-emerald-200 rounded-lg text-xs font-black text-emerald-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20" 
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100 col-span-1 md:col-span-2">
                  <button type="button" onClick={() => { setIsCreateModalOpen(false); setIsEditMode(false); }} className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors">Cancelar</button>
                  <button type="submit" className="bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-md flex items-center gap-2">
                    <Save className="w-4 h-4" /> {isEditMode ? 'Guardar Cambios' : 'Registrar Producto'}
                  </button>
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 shrink-0 bg-gray-50/50 rounded-b-2xl">
              <button onClick={() => { setIsCreateModalOpen(false); setIsEditMode(false); }} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">Cancelar</button>
              <button type="submit" form="create-form" disabled={!!duplicateWarning?.codeMatch && !isEditMode} className={`px-4 py-2 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm ${(duplicateWarning?.codeMatch && !isEditMode) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2563EB] hover:bg-blue-700'}`}><Save className="w-3.5 h-3.5" /> Guardar Producto</button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {isAdjustModalOpen && (
        <div className="absolute inset-0 bg-[#0B1120]/40 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-black text-[#0B1120] font-montserrat tracking-tight">Ajuste de Inventario</h2>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-gray-400 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4">
              <form id="adjust-form" onSubmit={handleAdjustStock} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Código de Producto</label>
                  <select required value={adjustForm.codigo} onChange={e => setAdjustForm({...adjustForm, codigo: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all">
                    <option value="">Seleccione un producto</option>
                    {inventory.map(p => <option key={p.codigo} value={p.codigo}>{p.codigo} - {p.detalle}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Tipo de Ajuste</label>
                    <select value={adjustForm.tipo} onChange={e => setAdjustForm({...adjustForm, tipo: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all">
                      <option value="Entrada">Entrada (+)</option>
                      <option value="Salida">Salida (-)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Cantidad</label>
                    <input required type="number" min="1" value={adjustForm.cantidad} onChange={e => setAdjustForm({...adjustForm, cantidad: Number(e.target.value)})} className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Motivo / Observación</label>
                  <input required type="text" value={adjustForm.motivo} onChange={e => setAdjustForm({...adjustForm, motivo: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all" placeholder="Ej: Mercancía dañada, Conteo físico..." />
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 shrink-0 bg-gray-50/50 rounded-b-2xl">
              <button onClick={() => setIsAdjustModalOpen(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors">Cancelar</button>
              <button type="submit" form="adjust-form" className="px-4 py-2 bg-[#0B1120] text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"><Save className="w-3.5 h-3.5" /> Procesar Ajuste</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedProduct && (
        <div className="absolute inset-0 bg-[#0B1120]/40 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative border border-gray-100 flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-black text-[#0B1120] font-montserrat tracking-tight">Ficha del Producto</h2>
              <div className="flex gap-2">
                <button onClick={() => {
                  setNewProduct({
                    ...selectedProduct,
                    costoEmpaque: selectedProduct.costoEmpaque || Number((selectedProduct.costoDolar * (selectedProduct.unidadesPorEmpaque || 1)).toFixed(2))
                  });
                  setIsEditMode(true);
                  setIsCreateModalOpen(true);
                  setIsDetailModalOpen(false);
                }} className="px-3 py-1.5 border border-gray-200 text-[#0B1120] rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:bg-gray-50 transition-colors">
                  <FileEdit className="w-3 h-3" /> Editar
                </button>
                <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors"><X className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Image Section */}
                <div className="w-full md:w-1/3 flex flex-col gap-3">
                  <div className="aspect-square bg-white border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-xs font-bold">Sin foto principal</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="aspect-square bg-white border border-gray-200 rounded-lg flex items-center justify-center"><ImageIcon className="w-6 h-6 text-gray-300" /></div>
                    <div className="aspect-square bg-white border border-gray-200 rounded-lg flex items-center justify-center"><ImageIcon className="w-6 h-6 text-gray-300" /></div>
                    <div className="aspect-square bg-white border border-dashed border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100 cursor-pointer transition-colors"><Plus className="w-6 h-6 text-gray-400" /></div>
                  </div>
                  {selectedProduct.codigoBarras && (
                    <div className="mt-2 bg-white p-3 rounded-xl border border-gray-200 flex flex-col items-center justify-center shadow-sm">
                      <ReactBarcode value={selectedProduct.codigoBarras} width={1.8} height={50} fontSize={14} background="#ffffff" lineColor="#000000" margin={0} />
                    </div>
                  )}
                </div>
                
                {/* Details Section */}
                <div className="w-full md:w-2/3 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-black text-[#0B1120] leading-tight mb-1">{selectedProduct.detalle}</h3>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#2563EB] font-bold bg-blue-50 px-2 py-0.5 rounded text-xs">{selectedProduct.codigo}</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{selectedProduct.marcaVehiculo}</span>
                      </div>
                    </div>
                    {/* Precios Principales - Arriba */}
                    <div className="flex gap-4 text-right">
                      <div className="group">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0 transition-colors">Precio Mayorista</div>
                        <div className="text-xl font-black text-[#10B981]">
                          {packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 
                            ? (selectedProduct.precioSecundarioMayor ? "$" + selectedProduct.precioSecundarioMayor.toFixed(2) : 'S/P') 
                            : "$" + (selectedProduct.precioMayor?.toFixed(2) || '0.00')}
                        </div>
                        <div className="text-[9px] text-gray-400 font-medium">
                          {packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 
                            ? (selectedProduct.precioSecundarioMayor ? formatBs(selectedProduct.precioSecundarioMayor) : 'S/P')
                            : (selectedProduct.precioMayor ? formatBs(selectedProduct.precioMayor) : 'S/P')}
                        </div>
                      </div>
                      <div className="group">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0 transition-colors">Precio Minorista</div>
                        <div className="text-xl font-black text-[#10B981]">
                          {packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 
                            ? (selectedProduct.precioSecundarioMinor ? "$" + selectedProduct.precioSecundarioMinor.toFixed(2) : 'S/P') 
                            : "$" + (selectedProduct.precioMinor?.toFixed(2) || '0.00')}
                        </div>
                        <div className="text-[9px] text-gray-400 font-medium">
                          {packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 
                            ? (selectedProduct.precioSecundarioMinor ? formatBs(selectedProduct.precioSecundarioMinor) : 'S/P')
                            : (selectedProduct.precioMinor ? formatBs(selectedProduct.precioMinor) : 'S/P')}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stock Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div 
                      className={`bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center ${selectedProduct.unidadesPorEmpaque > 1 ? 'cursor-pointer hover:bg-gray-50 group transition-all' : ''}`}
                      onClick={(e) => {
                         if (selectedProduct.unidadesPorEmpaque > 1) togglePackedView(e, selectedProduct.codigo);
                      }}
                      title={selectedProduct.unidadesPorEmpaque > 1 ? "Clic para alternar vista de unidades" : ""}
                    >
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 transition-colors group-hover:text-[#10B981]">Disp</div>
                      <>
                        {packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 ? (
                          <div className={`flex items-baseline gap-1.5 text-lg font-black ${selectedProduct.stockDisp > 0 ? 'text-[#10B981]' : 'text-red-500'}`}>
                            {Number((selectedProduct.stockDisp * selectedProduct.unidadesPorEmpaque).toFixed(2))}
                            <span className="text-[10px] font-bold text-gray-400 align-middle pb-0.5 uppercase">{selectedProduct.empaqueBase}</span>
                          </div>
                        ) : (
                          <div className={`flex items-baseline gap-1.5 text-lg font-black ${selectedProduct.stockDisp > 0 ? 'text-[#10B981]' : 'text-red-500'}`}>
                            {Number(selectedProduct.stockDisp.toFixed(2))}
                            <span className="text-[10px] font-bold text-gray-400 align-middle pb-0.5 uppercase">{selectedProduct.unidad}</span>
                          </div>
                        )}
                      </>
                    </div>
                    <div 
                        className={`bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center ${selectedProduct.unidadesPorEmpaque > 1 ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
                        onClick={(e) => { if (selectedProduct.unidadesPorEmpaque > 1) togglePackedView(e, selectedProduct.codigo); }}
                        title={selectedProduct.unidadesPorEmpaque > 1 ? "Clic para alternar vista de unidades" : ""}
                      >
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Comp</div>
                      <div 
                        className={`flex items-baseline gap-1.5 text-lg font-black text-orange-500 ${selectedProduct.stockComp > 0 ? 'cursor-pointer hover:underline' : ''}`}
                        onClick={(e) => { e.stopPropagation(); if(selectedProduct.stockComp > 0) setCommittedProduct(selectedProduct); }}
                      >
                        {packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 
                           ? Number((selectedProduct.stockComp * selectedProduct.unidadesPorEmpaque).toFixed(2)) 
                           : selectedProduct.stockComp}
                      </div>
                    </div>
                    <div 
                        className={`bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center ${selectedProduct.unidadesPorEmpaque > 1 ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
                        onClick={(e) => { if (selectedProduct.unidadesPorEmpaque > 1) togglePackedView(e, selectedProduct.codigo); }}
                        title={selectedProduct.unidadesPorEmpaque > 1 ? "Clic para alternar vista de unidades" : ""}
                    >
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Tránsito</div>
                      <div className="flex items-baseline gap-1.5 text-lg font-black text-purple-600">
                        {packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 
                           ? Number((selectedProduct.stockTrans * selectedProduct.unidadesPorEmpaque).toFixed(2)) 
                           : selectedProduct.stockTrans}
                      </div>
                    </div>
                  </div>

                  {/* Margins & Costs Grid */}
                  {userRole.permissions.inventario.verCostosUtilidad && (
                    <div className="grid grid-cols-3 gap-3">
                      <div 
                        className={`bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center text-center relative overflow-hidden ${selectedProduct.unidadesPorEmpaque > 1 ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
                        onClick={(e) => { if (selectedProduct.unidadesPorEmpaque > 1) togglePackedView(e, selectedProduct.codigo); }}
                        title={selectedProduct.unidadesPorEmpaque > 1 ? "Clic para alternar vista de unidades" : ""}
                      >
                        <div className="absolute top-0 right-0 p-1 opacity-5"><DollarSign className="w-8 h-8" /></div>
                        <div className="flex justify-between items-center px-1 mb-1 relative z-10 border-b border-gray-50 pb-1">
                          <div className="text-[8px] font-bold text-gray-400 uppercase">Último Costo</div>
                          <div className="text-[9px] font-medium text-gray-400 line-through">
                            {"$"}{packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 
                              ? ((selectedProduct.costoAnterior || 0) / selectedProduct.unidadesPorEmpaque).toFixed(2)
                              : (selectedProduct.costoAnterior || 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider mt-1 relative z-10">Costo Promedio</div>
                        <div className="text-base font-black text-[#0B1120] relative z-10">
                          {"$"}{packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 
                            ? ((selectedProduct.costoPromedio || 0) / selectedProduct.unidadesPorEmpaque).toFixed(2)
                            : (selectedProduct.costoPromedio || 0).toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-[#10B981]/5 p-2 rounded-lg shadow-sm border border-[#10B981]/20 flex flex-col justify-center text-center">
                        <div className="text-[9px] font-bold text-[#10B981] uppercase tracking-wider mb-0.5">Utilidad Mayorista</div>
                        <div className="text-base font-black text-[#0B1120]">
                          {packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 
                            ? (selectedProduct.costoPromedio && selectedProduct.precioSecundarioMayor
                                ? (((selectedProduct.precioSecundarioMayor - (selectedProduct.costoPromedio / selectedProduct.unidadesPorEmpaque)) / (selectedProduct.costoPromedio / selectedProduct.unidadesPorEmpaque)) * 100).toFixed(1) + '%'
                                : '0.0%')
                            : (selectedProduct.costoPromedio && selectedProduct.precioMayor 
                                ? (((selectedProduct.precioMayor - selectedProduct.costoPromedio) / selectedProduct.costoPromedio) * 100).toFixed(1) + '%'
                                : '0.0%')
                          }
                        </div>
                      </div>
                      <div className="bg-[#10B981]/5 p-2 rounded-lg shadow-sm border border-[#10B981]/20 flex flex-col justify-center text-center">
                        <div className="text-[9px] font-bold text-[#10B981] uppercase tracking-wider mb-0.5">Utilidad Minorista</div>
                        <div className="text-base font-black text-[#0B1120]">
                          {packedViewMode[selectedProduct.codigo] && selectedProduct.unidadesPorEmpaque > 1 
                            ? (selectedProduct.costoPromedio && selectedProduct.precioSecundarioMinor
                                ? (((selectedProduct.precioSecundarioMinor - (selectedProduct.costoPromedio / selectedProduct.unidadesPorEmpaque)) / (selectedProduct.costoPromedio / selectedProduct.unidadesPorEmpaque)) * 100).toFixed(1) + '%'
                                : '0.0%')
                            : (selectedProduct.costoPromedio && selectedProduct.precioMinor 
                                ? (((selectedProduct.precioMinor - selectedProduct.costoPromedio) / selectedProduct.costoPromedio) * 100).toFixed(1) + '%'
                                : '0.0%')
                          }
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-3 py-1.5 border-b border-gray-100 bg-gray-50/50">
                      <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Información Adicional</h4>
                    </div>
                    <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4">
                      <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Línea</div>
                        <div className="text-xs font-bold text-[#0B1120]">{selectedProduct.linea}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Proveedor</div>
                        <div className="text-xs font-bold text-[#0B1120] truncate" title={selectedProduct.proveedor}>{selectedProduct.proveedor}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Marca Repuesto</div>
                        <div className="text-xs font-bold text-[#0B1120]">{selectedProduct.marcaRepuesto || '-'}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Tipo Repuesto</div>
                        <div className="text-xs font-bold text-[#0B1120]">{selectedProduct.tipoRepuesto || '-'}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Referencia</div>
                        <div className="text-xs font-bold text-[#0B1120]">{selectedProduct.referencia || '-'}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Modelo</div>
                        <div className="text-xs font-bold text-[#0B1120]">{selectedProduct.modelo || '-'}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Procedencia</div>
                        <div className="text-xs font-bold text-[#0B1120]">{selectedProduct.procedencia || '-'}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Empaque</div>
                        <div className="text-xs font-bold text-[#0B1120]">
                          {selectedProduct.unidadesPorEmpaque > 1 ? selectedProduct.unidad : 'N/A'}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Relación Empaque</div>
                        <div className="text-xs font-bold text-[#2563EB]">
                          {selectedProduct.empaqueBase && selectedProduct.unidadesPorEmpaque > 1
                            ? `1 ${selectedProduct.unidad} = ${selectedProduct.unidadesPorEmpaque} ${selectedProduct.empaqueBase}s`
                            : '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Estatus</div>
                        <div className="text-xs font-bold text-[#0B1120]">Activo</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal for Committed Products */}
      {committedProduct && (
        <div className="fixed inset-0 bg-[#0B1120]/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[80vh] flex flex-col border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0B1120]">Desglose de Stock Comprometido</h3>
              <button 
                onClick={() => setCommittedProduct(null)}
                className="p-1 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <div className="mb-4 bg-orange-50 p-3 rounded-lg border border-orange-100">
                <div className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1">Producto</div>
                <div className="font-bold text-[#0B1120] text-sm">{committedProduct.detalle}</div>
                <div className="text-xs text-gray-500 mt-1">Total Comprometido: <span className="font-black text-orange-600">{committedProduct.stockComp} {committedProduct.unidad}</span></div>
              </div>
              
              <div className="text-xs text-gray-500 text-center py-8">
                Aquí se mostraría la lista de notas de entrega o pedidos pendientes que reservan este stock. 
                <br/>(Funcionalidad en desarrollo)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


