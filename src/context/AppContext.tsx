import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import rolesData from '../data/roles.json';

import {
  ExchangeRates, Role, SaleStatus, SaleItem, Sale, Client, Provider,
  InventoryConfig, Product, Receipt, PaymentMethod, PurchaseStatus,
  PaymentRecord, PurchaseItem, Purchase, Expense, CompanyConfig,
  SequencesConfig
} from '../types';

import mockSales from '../data/mockSales.json';
import clientsData from '../data/clients.json';
import inventoryData from '../data/inventory.json';

export const defaultInventoryConfig: InventoryConfig = {
  marcasRepuesto: [],
  marcasVehiculo: [],
  lineas: [],
  tiposRepuesto: []
};

interface AppContextType {
  rates: ExchangeRates;
  activeRate: 'BCV' | 'EUR';
  setActiveRate: (rate: 'BCV' | 'EUR') => void;
  minoristaRate: 'BCV' | 'EUR';
  setMinoristaRate: (rate: 'BCV' | 'EUR') => void;
  useSeparateMinoristaRate: boolean;
  setUseSeparateMinoristaRate: (val: boolean) => void;
  calculateBs: (usdPrice: number) => number;
  formatBs: (usdPrice: number) => string;
  userRole: Role;
  setUserRole: (role: Role) => void;
  roles: Role[];
  setRoles: (roles: Role[]) => void;
  updateRole: (updatedRole: Role) => void;
  canEditPrice: boolean;
  setCanEditPrice: (canEdit: boolean) => void;
  
  // Settings
  companyConfig: CompanyConfig;
  setCompanyConfig: React.Dispatch<React.SetStateAction<CompanyConfig>>;
  sequencesConfig: SequencesConfig;
  setSequencesConfig: React.Dispatch<React.SetStateAction<SequencesConfig>>;
  receipts: Receipt[];
  setReceipts: React.Dispatch<React.SetStateAction<Receipt[]>>;
  
  // Data
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  providers: Provider[];
  setProviders: React.Dispatch<React.SetStateAction<Provider[]>>;

  inventoryConfig: InventoryConfig;
  setInventoryConfig: React.Dispatch<React.SetStateAction<InventoryConfig>>;

  inventory: Product[];
  setInventory: React.Dispatch<React.SetStateAction<Product[]>>;
  purchases: Purchase[];
  setPurchases: React.Dispatch<React.SetStateAction<Purchase[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [rates, setRates] = useState<ExchangeRates>({ bcv: 0, eur: 0 });
  const [activeRate, setActiveRate] = useState<'BCV' | 'EUR'>(() => {
    return (localStorage.getItem('activeRate') as 'BCV' | 'EUR') || 'BCV';
  });
  const [minoristaRate, setMinoristaRate] = useState<'BCV' | 'EUR'>(() => {
    return (localStorage.getItem('minoristaRate') as 'BCV' | 'EUR') || 'BCV';
  });
  const [useSeparateMinoristaRate, setUseSeparateMinoristaRate] = useState<boolean>(() => {
    return localStorage.getItem('useSeparateMinoristaRate') === 'true';
  });
  
  const [roles, setRoles] = useState<Role[]>(() => {
    const saved = localStorage.getItem('app_roles');
    return saved ? JSON.parse(saved) : (rolesData as Role[]);
  });
  const [userRole, setUserRole] = useState<Role>(roles[0]); // Default to first role (Admin)
  const [canEditPrice, setCanEditPrice] = useState<boolean>(true); // Kept for legacy compatibility if needed, but better to use userRole.permissions.ventas.editarPrecio


  const [companyConfig, setCompanyConfig] = useState<CompanyConfig>(() => {
    const saved = localStorage.getItem('app_companyConfig');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.packagingTypes || parsed.packagingTypes.length === 0) {
        parsed.packagingTypes = ['CAJA', 'UND', 'BLT', 'JGO', 'SET', 'PQT', 'PAR'];
      }
      return parsed;
    }
    return {
      nombre: 'Mi Empresa, C.A.',
      rif: 'J-12345678-9',
      direccion: 'Av. Principal, Edificio Central, Local 1',
      firma: null,
      logo: null,
      paymentMethods: [
        { name: 'Efectivo', requiresRef: false },
        { name: 'Pago Móvil', requiresRef: true },
        { name: 'Transferencia', requiresRef: true }
      ],
      packagingTypes: ['CAJA', 'UND', 'BLT', 'JGO', 'SET', 'PQT', 'PAR']
    };
  });

  const [sequencesConfig, setSequencesConfig] = useState<SequencesConfig>(() => {
    const saved = localStorage.getItem('app_sequencesConfig');
    const defaultSeq = {
      pedido: 1,
      notaDespacho: 1000,
      factura: 1000,
      secuencia1: 1,
      secuencia2: 1,
      secuencia3: 1
    };
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultSeq, ...parsed };
    }
    return defaultSeq;
  });

  // Global Data States
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('app_sales');
    return saved ? JSON.parse(saved) : (mockSales as Sale[]);
  });
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('app_clients');
    return saved ? JSON.parse(saved) : (clientsData as Client[]);
  });
  
const mockProviders = [
  {
    id: "p1",
    tipoProveedor: 'J',
    rif: "29584736-2",
    razonSocial: "DISTRIBUIDORA ALIMENTOS CA",
    direccion: "ZONA INDUSTRIAL, CARACAS",
    telefono: "0212-555-1234",
    email: "ventas@alimentosca.com",
    credito: true,
    diasCredito: 15
  },
  {
    id: "p2",
    tipoProveedor: 'J',
    rif: "30123456-0",
    razonSocial: "SUMINISTROS MAYORISTAS SRL",
    direccion: "AV. PRINCIPAL VALENCIA",
    telefono: "0241-888-5678",
    email: "pedidos@suministros.com",
    credito: false,
    diasCredito: 0
  },
  {
    id: "p3",
    tipoProveedor: 'V',
    rif: "18234567-8",
    razonSocial: "JOSEFINA PEREZ",
    direccion: "BARQUISIMETO CENTRO",
    telefono: "0414-123-4567",
    email: "jperez@gmail.com",
    credito: true,
    diasCredito: 7
  }
];

  const [providers, setProviders] = useState<Provider[]>(() => {
    const saved = localStorage.getItem('app_providers');
    const parsed = saved ? JSON.parse(saved) : [];
    // If we have very few providers, inject the mock ones to ensure they appear for testing
    if (parsed.length < 3 && !parsed.some(p => p.razonSocial === "DISTRIBUIDORA ALIMENTOS CA")) {
      return [...parsed, ...mockProviders];
    }
    return parsed.length > 0 ? parsed : mockProviders;
  });

  const [inventoryConfig, setInventoryConfig] = useState<InventoryConfig>(() => {
    const saved = localStorage.getItem('inventoryConfig');
    return saved ? JSON.parse(saved) : defaultInventoryConfig;
  });

  useEffect(() => {
    localStorage.setItem('inventoryConfig', JSON.stringify(inventoryConfig));
  }, [inventoryConfig]);

  const [inventory, setInventory] = useState<Product[]>(() => {
    const saved = localStorage.getItem('app_inventory_v2');
    const parsed = saved ? JSON.parse(saved) : [];
    let initial = parsed.length === 0 ? (inventoryData as Product[]) : parsed;
    
    // Migrate to include ultimoCosto and costoPromedio and history array
    return initial.map(p => ({
      ...p,
      ultimoCosto: typeof p.ultimoCosto === 'number' ? p.ultimoCosto : (p.costoDolar || 0),
      costoPromedio: typeof p.costoPromedio === 'number' ? p.costoPromedio : (p.costoDolar || 0),
      historialCostos: p.historialCostos || []
    }));
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem('app_purchases');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('app_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  // Keep canEditPrice synced with role selection by default
  useEffect(() => {
    setCanEditPrice(userRole.permissions.ventas.editarPrecio);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('activeRate', activeRate);
  }, [activeRate]);

  useEffect(() => {
    localStorage.setItem('app_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('app_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('app_providers', JSON.stringify(providers));
  }, [providers]);

  useEffect(() => {
    localStorage.setItem('app_inventory_v2', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('app_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('app_expenses', JSON.stringify(expenses));
  }, [expenses]);




  useEffect(() => {
    localStorage.setItem('app_roles', JSON.stringify(roles));
  }, [roles]);

  useEffect(() => {
    localStorage.setItem('app_companyConfig', JSON.stringify(companyConfig));
  }, [companyConfig]);

  useEffect(() => {
    localStorage.setItem('app_sequencesConfig', JSON.stringify(sequencesConfig));
  }, [sequencesConfig]);


  useEffect(() => {
    const fetchRates = async () => {
      try {
        const [bcvRes, eurRes] = await Promise.all([
          fetch('https://ve.dolarapi.com/v1/dolares/oficial'),
          fetch('https://ve.dolarapi.com/v1/euros/oficial')
        ]);
        
        if (bcvRes.ok && eurRes.ok) {
          const bcvData = await bcvRes.json();
          const eurData = await eurRes.json();
          setRates({ 
            bcv: bcvData.promedio || 0, 
            eur: eurData.promedio || 0 
          });
        }
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  const calculateBs = (usdPrice: number) => {
    const rate = activeRate === 'BCV' ? rates.bcv : rates.eur;
    return usdPrice * rate;
  };

  const formatBs = (usdPrice: number) => {
    const bsValue = calculateBs(usdPrice);
    return `Bs. ${bsValue.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const updateRole = (updatedRole: Role) => {
    const newRoles = roles.map(r => r.id === updatedRole.id ? updatedRole : r);
    setRoles(newRoles);
    if (userRole.id === updatedRole.id) {
      setUserRole(updatedRole);
    }
    // Also save to a mock endpoint/file ideally, but since we are client side we'll just update state
  };

  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    const saved = localStorage.getItem('app_receipts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('app_receipts', JSON.stringify(receipts));
  }, [receipts]);

  return (
    <AppContext.Provider value={{
      inventoryConfig, setInventoryConfig, 
      rates, 
      activeRate, 
      setActiveRate,
      minoristaRate,
      setMinoristaRate,
      useSeparateMinoristaRate,
      setUseSeparateMinoristaRate, 
      calculateBs, 
      formatBs,
      userRole,
      setUserRole,
      roles,
      setRoles,
      updateRole,
      canEditPrice,
      setCanEditPrice,
      companyConfig,
      setCompanyConfig,
      sequencesConfig,
      setSequencesConfig,
      receipts,
      setReceipts,
      sales,
      setSales,
      clients,
      setClients,
      providers,
      setProviders,
      inventory,
      setInventory,
      purchases,
      setPurchases,
      expenses,
      setExpenses
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
