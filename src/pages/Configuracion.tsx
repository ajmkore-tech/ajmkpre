import { useState, useEffect } from 'react';
import { Box, Users, FileText, Shield, Plus, Edit2, Trash2, TrendingUp, Save, Settings, X, CheckSquare, Square, Building2, FileDigit } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Role } from '../types';

export default function Configuracion() {
  const [activeTab, setActiveTab] = useState<'acceso' | 'roles' | 'tasa' | 'empresa' | 'secuencias' | 'fiscales' | 'inventario'>('acceso');
  const { activeRate, setActiveRate, minoristaRate, setMinoristaRate, useSeparateMinoristaRate, setUseSeparateMinoristaRate, rates, roles, setRoles, updateRole, companyConfig, setCompanyConfig, sequencesConfig, setSequencesConfig, inventoryConfig, setInventoryConfig } = useAppContext();
  const [selectedRate, setSelectedRate] = useState<'BCV' | 'EUR'>(activeRate);
  const [localMinoristaRate, setLocalMinoristaRate] = useState<'BCV' | 'EUR'>(minoristaRate);
  const [localUseSeparateMinoristaRate, setLocalUseSeparateMinoristaRate] = useState<boolean>(useSeparateMinoristaRate);
  const [localCompanyConfig, setLocalCompanyConfig] = useState(companyConfig);
  const [localSequencesConfig, setLocalSequencesConfig] = useState(sequencesConfig);
  
  
  const [localInventoryConfig, setLocalInventoryConfig] = useState(inventoryConfig);
  const handleSaveInventoryConfig = () => {
    setInventoryConfig(localInventoryConfig);
    showToast('Listas predeterminadas guardadas correctamente.');
  };

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };


  const handleSaveCompanyConfig = () => {
    setCompanyConfig(localCompanyConfig);
    showToast('Configuración de empresa guardada correctamente.');
  };

  const handleSaveSequencesConfig = () => {
    setSequencesConfig(localSequencesConfig);
    showToast('Configuración de secuencias guardada correctamente.');
  };

  const handleFileChange = (e: any, field: 'firma' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalCompanyConfig(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const handleSaveRate = () => {
    setActiveRate(selectedRate);
    setMinoristaRate(localMinoristaRate);
    setUseSeparateMinoristaRate(localUseSeparateMinoristaRate);
    localStorage.setItem('activeRate', selectedRate);
    localStorage.setItem('minoristaRate', localMinoristaRate);
    localStorage.setItem('useSeparateMinoristaRate', localUseSeparateMinoristaRate.toString());
    showToast('Preferencia de tasa guardada correctamente.');
  };

  
  const handleAddRole = () => {
    const newRole: Role = {
      id: `role_${Date.now()}`,
      name: 'Nuevo Rol',
      modules: {
        inicio: true,
        inventario: false,
        ventas: false,
        clientes: false,
        compras: false,
        cxc: false,
        cxp: false,
        configuracion: false,
        reportes: false,
      },
      permissions: {
        ventas: { verPrecioMayorista: false, editarPrecio: false, editarTasa: false },
        inventario: {
          verCostosUtilidad: false,
          editarCostos: false,
        }
      }
    };
    setEditingRole(newRole);
  };

  const handleSaveRole = () => {
    if (editingRole) {
      if (!roles.find(r => r.id === editingRole.id)) {
        setRoles([...roles, editingRole]);
      } else {
        updateRole(editingRole);
      }
      setEditingRole(null);
      showToast('Rol guardado exitosamente.');
    }
  };

  const toggleModule = (moduleKey: string) => {
    if (editingRole) {
      setEditingRole({
        ...editingRole,
        modules: {
          ...editingRole.modules,
          [moduleKey]: !editingRole.modules[moduleKey]
        }
      });
    }
  };

  const togglePermission = (module: 'ventas' | 'inventario', permKey: string) => {
    if (editingRole) {
      setEditingRole({
        ...editingRole,
        permissions: {
          ...editingRole.permissions,
          [module]: {
            ...editingRole.permissions[module],
            [permKey]: !(editingRole.permissions as any)[module][permKey]
          }
        }
      });
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-transparent relative">
      {toastMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg font-bold text-sm animate-fade-in-down flex items-center gap-2">
          <CheckSquare className="w-5 h-5" /> {toastMessage}
        </div>
      )}

      <div className="px-8 py-6 flex flex-wrap items-center justify-between shrink-0 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#2563EB] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#0B1120] font-montserrat tracking-tight">Configuración</h2>
            <p className="text-[12px] text-gray-500 font-medium mt-0.5">Ajustes del sistema y control de acceso</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-1 bg-white border border-gray-200 rounded-xl shadow-sm mr-2">
            <button 
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'acceso' ? 'bg-[#F8FAFC] text-[#0B1120] shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-700'}`}
              onClick={() => setActiveTab('acceso')}
            >
              <Users className="w-3.5 h-3.5" /> Usuarios
            </button>
            <button 
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'roles' ? 'bg-[#F8FAFC] text-[#0B1120] shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-700'}`}
              onClick={() => setActiveTab('roles')}
            >
              <Shield className="w-3.5 h-3.5" /> Roles
            </button>
            <button 
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'tasa' ? 'bg-[#F8FAFC] text-[#0B1120] shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-700'}`}
              onClick={() => setActiveTab('tasa')}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Tasa Activa
            </button>
            <button 
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'empresa' ? 'bg-[#F8FAFC] text-[#0B1120] shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-700'}`}
              onClick={() => setActiveTab('empresa')}
            >
              <Building2 className="w-3.5 h-3.5" /> Empresa
            </button>
            <button 
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'secuencias' ? 'bg-[#F8FAFC] text-[#0B1120] shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-700'}`}
              onClick={() => setActiveTab('secuencias')}
            >
              <FileDigit className="w-3.5 h-3.5" /> Secuencias
            </button>
            <button 
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'fiscales' ? 'bg-[#F8FAFC] text-[#0B1120] shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-700'}`}
              onClick={() => setActiveTab('fiscales')}
            >
              <FileText className="w-3.5 h-3.5" /> Valores Fiscales
            </button>
            <button 
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${activeTab === 'inventario' ? 'bg-[#F8FAFC] text-[#0B1120] shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-700'}`}
              onClick={() => setActiveTab('inventario')}
            >
              <Box className="w-3.5 h-3.5" /> Inventario
            </button>
          </div>

        </div>
      </div>

      <div className="px-8 pb-6 flex flex-col gap-4">
                {activeTab === 'inventario' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-2xl mx-auto w-full mt-8">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-[#0B1120] font-montserrat">Tipos de Empaque</h3>
                <p className="text-xs text-gray-500 mt-1">Administra las presentaciones de tus productos (ej. CAJA, PIEZA).</p>
              </div>
            </div>
            <div className="p-8">
              <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  id="newPackagingType"
                  placeholder="Nuevo empaque..." 
                  className="flex-1 p-2.5 border border-gray-200 shadow-sm rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase" 
                  onKeyDown={(e) => {
                    if(e.key === 'Enter') {
                      const val = e.currentTarget.value.trim().toUpperCase();
                      if (val && !localCompanyConfig.packagingTypes?.includes(val)) {
                        setLocalCompanyConfig(prev => ({
                          ...prev,
                          packagingTypes: [...(prev.packagingTypes || []), val]
                        }));
                      }
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    const input = document.getElementById('newPackagingType') as HTMLInputElement;
                    const val = input.value.trim().toUpperCase();
                    if (val && !localCompanyConfig.packagingTypes?.includes(val)) {
                      setLocalCompanyConfig(prev => ({
                        ...prev,
                        packagingTypes: [...(prev.packagingTypes || []), val]
                      }));
                    }
                    input.value = '';
                  }}
                  className="bg-[#0B1120] text-white px-4 py-2 rounded-lg text-xs font-bold"
                >Agregar</button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {(localCompanyConfig.packagingTypes || []).map((pkg, idx) => (
                  <div key={idx} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                    {pkg}
                    {pkg !== 'UNIDAD' && (
                      <button 
                        onClick={() => setLocalCompanyConfig(prev => ({...prev, packagingTypes: prev.packagingTypes?.filter(p => p !== pkg)}))}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => {
                    setCompanyConfig(localCompanyConfig);
                    localStorage.setItem('app_companyConfig', JSON.stringify(localCompanyConfig));
                    alert('Tipos de empaque guardados correctamente');
                  }}
                  className="bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fiscales' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-2xl mx-auto w-full mt-8">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-[#0B1120] font-montserrat">Valores Fiscales</h3>
                <p className="text-xs text-gray-500 mt-1">Configuración de impuestos y retenciones.</p>
              </div>
            </div>
            <div className="p-8">
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 max-w-sm">
                <label className="block text-xs font-bold text-gray-700 mb-2">IVA Venta (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={localCompanyConfig.ivaVenta ?? ''} 
                    onChange={e => setLocalCompanyConfig(prev => ({...prev, ivaVenta: Number(e.target.value)}))} 
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-200 shadow-sm rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-bold">%</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Este valor se sumará al total de los pedidos cuando el tipo de documento sea Factura.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'acceso' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="text-sm font-bold text-[#0B1120] font-montserrat uppercase tracking-wider">Usuarios Registrados</h3>
              <button className="bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 font-montserrat uppercase tracking-wider">
                <Plus className="w-4 h-4" /> Agregar Usuario
              </button>
            </div>
            
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-max">
                <thead className="bg-[#0B1120] text-white text-[10px] uppercase tracking-wider sticky top-0 z-10 font-montserrat">
                  <tr>
                    <th className="px-5 py-4 font-bold">Usuario</th>
                    <th className="px-5 py-4 font-bold">Nombre y Apellido</th>
                    <th className="px-5 py-4 font-bold">Correo</th>
                    <th className="px-5 py-4 font-bold">Teléfono</th>
                    <th className="px-5 py-4 font-bold">Rol</th>
                    <th className="px-5 py-4 font-bold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] text-[#0F172A] divide-y divide-gray-100">
                  <tr className="hover:bg-blue-50/50 cursor-pointer transition-colors group">
                    <td className="px-5 py-4 font-mono font-bold text-[#2563EB]">rrodriguez</td>
                    <td className="px-5 py-4 font-medium">R. Rodriguez</td>
                    <td className="px-5 py-4 text-gray-500">rrodriguez@admin.com</td>
                    <td className="px-5 py-4 text-gray-500">-</td>
                    <td className="px-5 py-4">
                      <span className="bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20 px-2.5 py-1 rounded-full font-bold">Admin</span>
                    </td>
                    <td className="px-5 py-4 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-[#2563EB] hover:bg-blue-50 p-1.5 rounded transition-colors" title="Editar">
                        <Edit2 className="w-4 h-4"/>
                      </button>
                      <button className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors" title="Eliminar">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            {editingRole ? (
              <div className="flex flex-col">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#0B1120] font-montserrat uppercase tracking-wider">
                      Editando Rol: 
                    </h3>
                    <input 
                      type="text" 
                      value={editingRole.name} 
                      onChange={(e) => setEditingRole({...editingRole, name: e.target.value})}
                      className="px-2 py-1 text-sm font-bold text-[#2563EB] border border-gray-200 rounded focus:outline-none focus:border-blue-500 bg-gray-50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingRole(null)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleSaveRole}
                      className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm shadow-blue-500/20"
                    >
                      <Save className="w-4 h-4" /> Guardar Cambios
                    </button>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col gap-8">
                  {/* Modulos */}
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Módulos Visibles</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.keys(editingRole.modules).map((modKey) => (
                        <label key={modKey} className="flex items-center gap-3 cursor-pointer group p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                          <div onClick={() => toggleModule(modKey)}>
                            {editingRole.modules[modKey]
                              ? <CheckSquare className="w-5 h-5 text-blue-600" />
                              : <Square className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                            }
                          </div>
                          <span className="text-sm font-bold text-gray-700 capitalize select-none" onClick={() => toggleModule(modKey)}>{modKey}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Permisos Específicos */}
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Permisos Específicos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Ventas */}
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <h5 className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-3">Módulo: Ventas</h5>
                        <div className="space-y-3">
                          
                          
                          
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div onClick={() => togglePermission('ventas', 'verPrecioMayorista')}>
                              {editingRole.permissions.ventas.verPrecioMayorista ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />}
                            </div>
                            <span className="text-xs font-bold text-gray-600 select-none" onClick={() => togglePermission('ventas', 'verPrecioMayorista')}>Usar Precio Mayorista</span>
                          </label>
                          
                          
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div onClick={() => togglePermission('ventas', 'editarPrecio')}>
                              {editingRole.permissions.ventas.editarPrecio ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />}
                            </div>
                            <span className="text-xs font-bold text-gray-600 select-none" onClick={() => togglePermission('ventas', 'editarPrecio')}>Permitir Editar Precio/Costo manualmente</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div onClick={() => togglePermission('ventas', 'editarTasa')}>
                              {editingRole.permissions.ventas.editarTasa ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />}
                            </div>
                            <span className="text-xs font-bold text-gray-600 select-none" onClick={() => togglePermission('ventas', 'editarTasa')}>Permitir Editar/Seleccionar Tasa</span>
                          </label>
                        </div>
                      </div>

                      {/* Inventario */}
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <h5 className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-3">Módulo: Inventario</h5>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div onClick={() => togglePermission('inventario', 'verCostosUtilidad')}>
                              {editingRole.permissions.inventario.verCostosUtilidad ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />}
                            </div>
                            <span className="text-xs font-bold text-gray-600 select-none" onClick={() => togglePermission('inventario', 'verCostosUtilidad')}>Ver Costos y Utilidad</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div onClick={() => togglePermission('inventario', 'editarCostos')}>
                              {editingRole.permissions.inventario.editarCostos ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />}
                            </div>
                            <span className="text-xs font-bold text-gray-600 select-none" onClick={() => togglePermission('inventario', 'editarCostos')}>Editar Costos (Manual)</span>
                          </label>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="p-5 border-b border-gray-100 flex justify-between items-center shrink-0">
                  <h3 className="text-sm font-bold text-[#0B1120] font-montserrat uppercase tracking-wider">Roles Disponibles</h3>
                  <button 
                    onClick={handleAddRole}
                    className="bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 font-montserrat uppercase tracking-wider"
                  >
                    <Plus className="w-4 h-4" /> Agregar Rol
                  </button>
                </div>
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse min-w-max">
                    <thead className="bg-[#0B1120] text-white text-[10px] uppercase tracking-wider sticky top-0 z-10 font-montserrat">
                      <tr>
                        <th className="px-5 py-4 font-bold">Rol</th>
                        <th className="px-5 py-4 font-bold">Descripción / Permisos</th>
                        <th className="px-5 py-4 font-bold text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px] text-[#0F172A] divide-y divide-gray-100">
                      {roles.map(role => (
                        <tr key={role.id} className="hover:bg-blue-50/50 transition-colors group">
                          <td className="px-5 py-4 font-bold text-[#2563EB]">{role.name}</td>
                          <td className="px-5 py-4 font-medium text-gray-500">
                            {Object.keys(role.modules).filter(k => role.modules[k]).length} Módulos habilitados
                          </td>
                          <td className="px-5 py-4 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingRole(role)} className="text-[#2563EB] hover:bg-blue-50 p-1.5 rounded transition-colors" title="Editar Rol">
                              <Edit2 className="w-4 h-4"/>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        
        {activeTab === 'empresa' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-2xl mx-auto w-full mt-8">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#0B1120] font-montserrat">Datos de la Empresa</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Nombre de la Empresa</label>
                <input type="text" value={localCompanyConfig.nombre} onChange={e => setLocalCompanyConfig(prev => ({...prev, nombre: e.target.value}))} className="w-full p-2.5 border border-gray-200 shadow-sm rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">RIF / Identificación</label>
                <input type="text" value={localCompanyConfig.rif} onChange={e => setLocalCompanyConfig(prev => ({...prev, rif: e.target.value}))} className="w-full p-2.5 border border-gray-200 shadow-sm rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Dirección</label>
                <textarea value={localCompanyConfig.direccion} onChange={e => setLocalCompanyConfig(prev => ({...prev, direccion: e.target.value}))} className="w-full p-2.5 border rounded-lg text-sm bg-gray-50 h-24" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Logo de la Empresa (Para Recibos/Notas)</label>
                <input type="file" accept="image/jpeg, image/png" onChange={(e) => handleFileChange(e, 'logo')} className="w-full text-sm" />
                {localCompanyConfig.logo && (
                  <img src={localCompanyConfig.logo} alt="Logo" className="mt-4 h-24 object-contain border border-gray-200 p-2 rounded-lg bg-gray-50" />
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Firma Digitalizada (Para Nota de Despacho / Recibos)</label>
                <input type="file" accept="image/jpeg, image/png" onChange={(e) => handleFileChange(e, 'firma')} className="w-full text-sm" />
                {localCompanyConfig.firma && (
                  <img src={localCompanyConfig.firma} alt="Firma" className="mt-4 h-24 object-contain border border-gray-200 p-2 rounded-lg bg-gray-50" />
                )}
              </div>

              <div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-6 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold text-[#0B1120] font-montserrat">Tipos de Pago</h4>
                  <button 
                    onClick={() => setLocalCompanyConfig(prev => ({...prev, paymentMethods: [...(prev.paymentMethods || []), { name: '', requiresRef: false }]}))}
                    className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Método
                  </button>
                </div>
                <div className="space-y-3">
                  {localCompanyConfig.paymentMethods?.map((pm, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          value={pm.name} 
                          placeholder="Nombre del método (ej. Zelle)"
                          onChange={e => {
                            const newMethods = [...(localCompanyConfig.paymentMethods || [])];
                            newMethods[idx].name = e.target.value;
                            setLocalCompanyConfig(prev => ({...prev, paymentMethods: newMethods}));
                          }} 
                          className="w-full p-2.5 border border-gray-200 shadow-sm rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                        />
                      </div>
                      <div className="flex items-center gap-2 w-48">
                        <input 
                          type="checkbox" 
                          id={`req-ref-${idx}`}
                          checked={pm.requiresRef} 
                          onChange={e => {
                            const newMethods = [...(localCompanyConfig.paymentMethods || [])];
                            newMethods[idx].requiresRef = e.target.checked;
                            setLocalCompanyConfig(prev => ({...prev, paymentMethods: newMethods}));
                          }} 
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                        />
                        <label htmlFor={`req-ref-${idx}`} className="text-xs font-bold text-gray-600 cursor-pointer">Requiere Referencia</label>
                      </div>
                      <button 
                        onClick={() => {
                          const newMethods = localCompanyConfig.paymentMethods?.filter((_, i) => i !== idx);
                          setLocalCompanyConfig(prev => ({...prev, paymentMethods: newMethods || []}));
                        }}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(!localCompanyConfig.paymentMethods || localCompanyConfig.paymentMethods.length === 0) && (
                    <div className="text-sm text-gray-500 text-center py-4">No hay métodos de pago configurados.</div>
                  )}
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 flex justify-end pt-4 border-t border-gray-100 mt-2">
                <button onClick={handleSaveCompanyConfig} className="bg-[#2563EB] text-white px-8 py-3 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700">
                  <Save className="w-4 h-4" /> Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'secuencias' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-2xl mx-auto w-full mt-8">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#0B1120] font-montserrat">Secuencias de Documentos</h3>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <label className="block text-xs font-bold text-gray-700 mb-2">Correlativo Nota de Despacho</label>
                <input type="number" value={localSequencesConfig.notaDespacho} onChange={e => setLocalSequencesConfig(prev => ({...prev, notaDespacho: Number(e.target.value)}))} className="w-full p-2.5 border border-gray-200 shadow-sm rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
              </div>
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <label className="block text-xs font-bold text-gray-700 mb-2">Correlativo Recibo de Cobro</label>
                <input type="number" value={localSequencesConfig.secuencia1 ?? 1} onChange={e => setLocalSequencesConfig(prev => ({...prev, secuencia1: Number(e.target.value)}))} className="w-full p-2.5 border border-gray-200 shadow-sm rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
              </div>
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <label className="block text-xs font-bold text-gray-700 mb-2">Número de Factura (Secuencia 2)</label>
                <input type="number" value={localSequencesConfig.secuencia2 ?? 1} onChange={e => setLocalSequencesConfig(prev => ({...prev, secuencia2: Number(e.target.value)}))} className="w-full p-2.5 border border-gray-200 shadow-sm rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
              </div>
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <label className="block text-xs font-bold text-gray-700 mb-2">Número de Control (Secuencia 3)</label>
                <input type="number" value={localSequencesConfig.secuencia3 ?? 1} onChange={e => setLocalSequencesConfig(prev => ({...prev, secuencia3: Number(e.target.value)}))} className="w-full p-2.5 border border-gray-200 shadow-sm rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" />
              </div>
              <div className="col-span-1 md:col-span-2 flex justify-end pt-4 border-t border-gray-100 mt-2">
                <button onClick={handleSaveSequencesConfig} className="bg-[#2563EB] text-white px-8 py-3 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700">
                  <Save className="w-4 h-4" /> Guardar
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'tasa' && (
          <div className="space-y-8 max-w-2xl mx-auto w-full mt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#0B1120] font-montserrat">Configuración de Moneda Base</h3>
            </div>
            <div className="p-8">
              <p className="text-sm text-gray-500 mb-8 font-medium">
                Selecciona la tasa de referencia que el sistema utilizará por defecto para calcular los montos en Bolívares a partir de los precios base en Dólares.
              </p>
              
              <div className="space-y-4 mb-8">
                <label className={`flex items-center p-5 border rounded-xl cursor-pointer transition-all ${selectedRate === 'BCV' ? 'border-[#2563EB] bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input 
                    type="radio" 
                    name="rate" 
                    value="BCV"
                    checked={selectedRate === 'BCV'}
                    onChange={() => setSelectedRate('BCV')}
                    className="w-5 h-5 text-[#2563EB] border-gray-300 focus:ring-[#2563EB]"
                  />
                  <div className="ml-4 flex-1 flex justify-between items-center">
                    <span className="block text-sm font-bold text-[#0B1120]">Tasa Oficial (Dólares BCV)</span>
                    <span className="text-xs font-mono bg-[#2563EB] text-white px-3 py-1.5 rounded-lg font-bold shadow-sm shadow-blue-500/20">Bs. {rates.bcv.toFixed(2)}</span>
                  </div>
                </label>

                <label className={`flex items-center p-5 border rounded-xl cursor-pointer transition-all ${selectedRate === 'EUR' ? 'border-[#2563EB] bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input 
                    type="radio" 
                    name="rate" 
                    value="EUR"
                    checked={selectedRate === 'EUR'}
                    onChange={() => setSelectedRate('EUR')}
                    className="w-5 h-5 text-[#2563EB] border-gray-300 focus:ring-[#2563EB]"
                  />
                  <div className="ml-4 flex-1 flex justify-between items-center">
                    <span className="block text-sm font-bold text-[#0B1120]">Tasa Oficial (Euros BCV)</span>
                    <span className="text-xs font-mono bg-[#2563EB] text-white px-3 py-1.5 rounded-lg font-bold shadow-sm shadow-blue-500/20">Bs. {rates.eur.toFixed(2)}</span>
                  </div>
                </label>
              </div>




            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-base font-bold text-[#0B1120] font-montserrat">Configuración de Moneda (Minorista)</h3>
            </div>
            <div className="p-8">
              <p className="text-sm text-gray-500 mb-8 font-medium">
                Selecciona la tasa que aplicará específicamente para los pedidos y ventas con tipo de precio Minorista.
              </p>
              
              <div className="space-y-4 mb-8">
                <label className={`flex items-center p-5 border rounded-xl cursor-pointer transition-all ${localMinoristaRate === 'BCV' ? 'border-[#2563EB] bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input 
                    type="radio" 
                    name="minoristaRateMain" 
                    value="BCV"
                    checked={localMinoristaRate === 'BCV'}
                    onChange={() => setLocalMinoristaRate('BCV')}
                    className="w-5 h-5 text-[#2563EB] border-gray-300 focus:ring-[#2563EB]"
                  />
                  <div className="ml-4 flex-1 flex justify-between items-center">
                    <span className="block text-sm font-bold text-[#0B1120]">Tasa Oficial (Dólares BCV)</span>
                    <span className="text-xs font-mono bg-[#2563EB] text-white px-3 py-1.5 rounded-lg font-bold shadow-sm shadow-blue-500/20">Bs. {rates.bcv.toFixed(2)}</span>
                  </div>
                </label>
                <label className={`flex items-center p-5 border rounded-xl cursor-pointer transition-all ${localMinoristaRate === 'EUR' ? 'border-[#2563EB] bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input 
                    type="radio" 
                    name="minoristaRateMain" 
                    value="EUR"
                    checked={localMinoristaRate === 'EUR'}
                    onChange={() => setLocalMinoristaRate('EUR')}
                    className="w-5 h-5 text-[#2563EB] border-gray-300 focus:ring-[#2563EB]"
                  />
                  <div className="ml-4 flex-1 flex justify-between items-center">
                    <span className="block text-sm font-bold text-[#0B1120]">Tasa Paralelo (Dólares EUR)</span>
                    <span className="text-xs font-mono bg-[#2563EB] text-white px-3 py-1.5 rounded-lg font-bold shadow-sm shadow-blue-500/20">Bs. {rates.eur.toFixed(2)}</span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button 
                  onClick={handleSaveRate}
                  className="bg-[#2563EB] text-white px-8 py-3 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 font-montserrat uppercase tracking-wider"
                >
                  <Save className="w-4 h-4" /> Guardar Preferencias
                </button>
              </div>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}
