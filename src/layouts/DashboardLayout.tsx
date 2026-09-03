import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FileText, LayoutDashboard, ShoppingCart, DollarSign, Package, CreditCard, Wallet, LogOut, ArrowRightLeft, Settings, Users, Shield, ShieldAlert, CheckSquare, Square } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { rates, userRole, setUserRole, roles, updateRole } = useAppContext();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const allMenuItems = [
    { id: 'inicio', name: 'Inicio', path: '/inicio', icon: LayoutDashboard },
    { id: 'inventario', name: 'Inventario', path: '/inventarios', icon: Package },
    { id: 'ventas', name: 'Ventas', path: '/ventas', icon: ShoppingCart },
    { id: 'clientes', name: 'Directorio', path: '/clientes', icon: Users },
    { id: 'compras', name: 'Compras', path: '/compras', icon: DollarSign },
    { id: 'cxc', name: 'Por Cobrar', path: '/cxc', icon: Wallet },
    { id: 'cxp', name: 'Por Pagar', path: '/cxp', icon: CreditCard },
    { id: 'reportes', name: 'Reportes', path: '/reportes', icon: FileText },
    { id: 'configuracion', name: 'Configuración', path: '/configuracion', icon: Settings },
  ];

  const menuItems = allMenuItems.filter(item => userRole.modules[item.id]);

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/inicio': return { title: 'INICIO', sub: 'PANEL PRINCIPAL' };
      case '/ventas': return { title: 'VENTAS', sub: 'GESTIÓN DE VENTAS' };
      case '/clientes': return { title: 'CLIENTES', sub: 'DIRECTORIO COMERCIAL' };
      case '/compras': return { title: 'COMPRAS', sub: 'GESTIÓN DE COMPRAS' };
      case '/inventarios': return { title: 'INVENTARIOS', sub: 'MAESTRO Y KARDEX' };
      case '/cxc': return { title: 'POR COBRAR', sub: 'INGRESOS PENDIENTES' };
      case '/cxp': return { title: 'POR PAGAR', sub: 'OBLIGACIONES' };
      case '/reportes': return { title: 'REPORTES', sub: 'DOCUMENTOS EMITIDOS' };
      case '/configuracion': return { title: 'CONFIGURACIÓN', sub: 'AJUSTES DEL SISTEMA' };
      default: return { title: 'SISTEMA', sub: 'AJM SYSTEM' };
    }
  };

  const { title, sub } = getPageInfo();

  // Helper for inline permission toggling in the quick simulator
  const togglePermission = (module: 'ventas' | 'inventario', perm: string) => {
    const updatedRole = { ...userRole };
    updatedRole.permissions[module] = {
      ...updatedRole.permissions[module],
      [perm]: !(updatedRole.permissions as any)[module][perm]
    };
    updateRole(updatedRole);
  };

  return (
    <div className="h-screen w-full bg-[#F8FAFC] flex font-sans text-[#0F172A] overflow-hidden">
      {/* Sidebar */}
      <aside className="bg-[#0B1120] flex flex-col text-white shadow-xl z-20 shrink-0 w-[84px] h-full">
        <div className="p-4 flex items-center justify-center gap-3 shrink-0 h-[88px]">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
            <span className="text-[#0B1120] font-black text-xl font-montserrat">A</span>
          </div>
        </div>
        
        <nav className="flex-1 py-4 flex flex-col w-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <ul className="flex flex-col space-y-3 w-full px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name} className="w-full relative group">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex flex-col items-center justify-center py-2 px-1 w-full rounded-xl transition-all h-[64px] ${
                        isActive 
                          ? 'bg-[#2563EB] text-white shadow-[0_4px_15px_rgba(37,99,235,0.4)]' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 mb-1.5 shrink-0" />
                    <span className="text-[8px] font-bold text-center leading-[1.1] uppercase tracking-wide px-1">
                      {item.name}
                    </span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 mx-2 mb-4 shrink-0 flex flex-col items-center">
          <div className="flex items-center justify-center bg-white/5 rounded-xl border border-white/10 p-2 cursor-pointer hover:bg-white/10 transition-colors w-full h-[64px] flex-col">
            <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center text-[10px] font-bold text-white shadow-md shrink-0 mb-1">RR</div>
            <span className="text-[8px] font-bold text-center leading-[1.1] uppercase tracking-wide text-gray-400">Perfil</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative min-w-0">
        {/* Global Top Header */}
        <header className="h-[72px] bg-white border-b border-gray-100 px-8 flex items-center justify-between shrink-0 shadow-sm z-10 w-full">
          {/* Left: Title Area */}
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-[#0B1120] font-montserrat uppercase tracking-wider leading-none">{title}</h1>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-montserrat mt-1 leading-none">{sub}</span>
            </div>
          </div>

          {/* Right: Rates and User Actions */}
          <div className="flex items-center gap-4">
            
            {/* Simulador de Rol (Temporal para Pruebas) */}
            <div className="relative" ref={roleMenuRef}>
              <div 
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-colors border ${
                  userRole.id === 'role_admin' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-orange-50 border-orange-100 text-orange-700'
                }`}
              >
                {userRole.id === 'role_admin' ? <Shield className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                <span className="text-[10px] font-bold uppercase tracking-wider">{userRole.name}</span>
              </div>
              
              {showRoleMenu && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-3 bg-gray-50 border-b border-gray-100">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Simulador de Rol</span>
                  </div>
                  <div className="p-2 flex flex-col gap-1">
                    {roles.map(r => (
                      <button 
                        key={r.id}
                        onClick={() => setUserRole(r)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-left transition-colors text-xs font-bold ${
                          userRole.id === r.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {r.id === 'role_admin' ? <Shield className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />} 
                        {r.name}
                      </button>
                    ))}
                  </div>
                  
                  {userRole.id !== 'role_admin' && (
                    <div className="p-3 border-t border-gray-100 bg-gray-50">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Permisos Rápidos (Simulación)</div>
                      
                      <label className="flex items-center justify-between cursor-pointer group py-1">
                        <span className="text-[10px] font-bold text-gray-700 select-none">Venta Local</span>
                        <div onClick={() => togglePermission('ventas', 'ventaLocal')}>
                          {userRole.permissions.ventas.ventaLocal
                            ? <CheckSquare className="w-4 h-4 text-blue-600" /> 
                            : <Square className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                          }
                        </div>
                      </label>
                      <label className="flex items-center justify-between cursor-pointer group py-1">
                        <span className="text-[10px] font-bold text-gray-700 select-none">Venta Externa</span>
                        <div onClick={() => togglePermission('ventas', 'ventaExterna')}>
                          {userRole.permissions.ventas.ventaExterna
                            ? <CheckSquare className="w-4 h-4 text-blue-600" /> 
                            : <Square className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                          }
                        </div>
                      </label>
                      <label className="flex items-center justify-between cursor-pointer group py-1">
                        <span className="text-[10px] font-bold text-gray-700 select-none">Precio Mayorista</span>
                        <div onClick={() => togglePermission('ventas', 'verPrecioMayorista')}>
                          {userRole.permissions.ventas.verPrecioMayorista
                            ? <CheckSquare className="w-4 h-4 text-blue-600" /> 
                            : <Square className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                          }
                        </div>
                      </label>
                      <label className="flex items-center justify-between cursor-pointer group py-1">
                        <span className="text-[10px] font-bold text-gray-700 select-none">Precio Minorista</span>
                        <div onClick={() => togglePermission('ventas', 'verPrecioMinorista')}>
                          {userRole.permissions.ventas.verPrecioMinorista
                            ? <CheckSquare className="w-4 h-4 text-blue-600" /> 
                            : <Square className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                          }
                        </div>
                      </label>
                      <label className="flex items-center justify-between cursor-pointer group py-1">
                        <span className="text-[10px] font-bold text-gray-700 select-none">Editar Costo/Precio</span>
                        <div onClick={() => togglePermission('ventas', 'editarPrecio')}>
                          {userRole.permissions.ventas.editarPrecio
                            ? <CheckSquare className="w-4 h-4 text-blue-600" /> 
                            : <Square className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                          }
                        </div>
                      </label>
                      <label className="flex items-center justify-between cursor-pointer group py-1">
                        <span className="text-[10px] font-bold text-gray-700 select-none">Ver Costos (Inventario)</span>
                        <div onClick={() => togglePermission('inventario', 'verCostosUtilidad')}>
                          {userRole.permissions.inventario.verCostosUtilidad
                            ? <CheckSquare className="w-4 h-4 text-blue-600" /> 
                            : <Square className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                          }
                        </div>
                      </label>

                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rates Pill */}
            <div className="flex items-center gap-4 bg-[#F8FAFC] border border-gray-100 rounded-full p-1.5 px-5 shadow-sm">
              <div className="bg-[#2563EB] p-1.5 rounded-full text-white shadow-md shadow-blue-500/20">
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-[#2563EB] uppercase tracking-widest font-montserrat">Tasa Operativa BCV</span>
                <span className="text-[12px] font-black text-[#0F172A] leading-tight">{rates.bcv.toFixed(2)} BS. <span className="text-[#10B981] ml-1">●</span></span>
              </div>
              <div className="w-px h-6 bg-gray-200 mx-1"></div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-[#2563EB] uppercase tracking-widest font-montserrat">Tasa EUR</span>
                <span className="text-[12px] font-black text-[#0F172A] leading-tight">{rates.eur.toFixed(2)} BS.</span>
              </div>
            </div>

            {/* Currency/Lang selectors from image */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full p-2 px-4 shadow-sm">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-bold text-[#0B1120] font-montserrat">USD</span>
              <div className="w-px h-4 bg-gray-200 mx-2"></div>
              <span className="text-xs font-bold text-gray-400 font-montserrat">ES</span>
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <div className="flex-1 overflow-auto bg-[#F8FAFC]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
