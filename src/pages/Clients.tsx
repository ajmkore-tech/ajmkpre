import React, { useState } from 'react';
import { Search, Plus, FileEdit, Trash2, User, Building2, MapPin, Phone, CreditCard, Tag, X, Briefcase } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Client, Provider } from '../types';

export default function Clients() {
  const { clients, setClients, providers, setProviders } = useAppContext();
  const [activeTab, setActiveTab] = useState<'clientes' | 'proveedores'>('clientes');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Clients Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Providers Modal State
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);

  const filteredClients = clients.filter(c => 
    c.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.rif.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProviders = providers.filter(p => 
    p.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.rif.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openClientModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
    } else {
      setEditingClient({
        id: Math.random().toString(36).substr(2, 9),
        tipoCliente: 'V',
        razonSocial: '',
        rif: '',
        direccion: '',
        telefono: '',
        tipoPrecio: 'Minorista',
        credito: false,
        diasCredito: 0
      });
    }
    setIsModalOpen(true);
  };

  const openProviderModal = (provider?: Provider) => {
    if (provider) {
      setEditingProvider(provider);
    } else {
      setEditingProvider({
        id: Math.random().toString(36).substr(2, 9),
        tipoProveedor: 'J',
        razonSocial: '',
        rif: '',
        direccion: '',
        telefono: '',
        email: '',
        credito: false,
        diasCredito: 0
      });
    }
    setIsProviderModalOpen(true);
  };

  const handleDeleteClient = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este cliente?")) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const handleSaveClient = () => {
    if (editingClient) {
      
      
      const duplicateRs = clients.find(c => c.razonSocial.toLowerCase() === editingClient.razonSocial.toLowerCase() && c.id !== editingClient.id);
      if (duplicateRs) {
        alert("Ya existe un cliente con esta misma Razón Social.");
        return;
      }

      const existingIdx = clients.findIndex(c => c.id === editingClient.id);
      if (existingIdx >= 0) {
        const newClients = [...clients];
        newClients[existingIdx] = {
          ...editingClient,
          auditLog: [...(editingClient.auditLog || []), { date: new Date().toISOString(), action: 'Editado' }]
        };
        setClients(newClients);
      } else {
        const newClient = {
          ...editingClient,
          auditLog: [{ date: new Date().toISOString(), action: 'Creado' }]
        };
        setClients([newClient, ...clients]);
      }
    }
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleSaveProvider = () => {
    if (editingProvider) {
      const existingIdx = providers.findIndex(p => p.id === editingProvider.id);
      if (existingIdx >= 0) {
        const newProviders = [...providers];
        newProviders[existingIdx] = editingProvider;
        setProviders(newProviders);
      } else {
        setProviders([editingProvider, ...providers]);
      }
    }
    setIsProviderModalOpen(false);
    setEditingProvider(null);
  };

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-[#0B1120] font-montserrat tracking-tight">Directorio</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">Gestiona la información de clientes y proveedores.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('clientes')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'clientes' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Clientes
            </button>
            <button 
              onClick={() => setActiveTab('proveedores')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'proveedores' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Proveedores
            </button>
          </div>
          
          <button 
            onClick={() => activeTab === 'clientes' ? openClientModal() : openProviderModal()}
            className="bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20 font-montserrat uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> Nuevo {activeTab === 'clientes' ? 'Cliente' : 'Proveedor'}
          </button>
        </div>
      </div>

      <div className="p-8 flex-1 overflow-auto custom-scrollbar">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4 items-center shrink-0">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={`Buscar ${activeTab === 'clientes' ? 'cliente' : 'proveedor'} por razón social o RIF...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all bg-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            {activeTab === 'clientes' ? (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 text-[10px] uppercase font-bold text-gray-500 tracking-wider sticky top-0 backdrop-blur-sm z-10">
                  <tr>
                    <th className="px-6 py-4 border-b border-gray-100">Razón Social</th>
                    <th className="px-6 py-4 border-b border-gray-100">Contacto</th>
                    <th className="px-6 py-4 border-b border-gray-100">Ubicación</th>
                    <th className="px-6 py-4 border-b border-gray-100">Condiciones</th>
                    <th className="px-6 py-4 border-b border-gray-100 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {filteredClients.map(client => (
                    <tr key={client.id} className="hover:bg-[#F8FAFC] transition-colors group cursor-pointer" onClick={() => openClientModal(client)}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#0B1120]">{client.razonSocial}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{client.tipoCliente ? `${client.tipoCliente}-` : ""}{client.rif}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{client.telefono || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-xs font-medium line-clamp-1">{client.direccion || 'No especificada'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Tag className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs font-bold text-gray-700">{client.tipoPrecio}</span>
                        </div>
                        {client.credito ? (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md w-fit">
                            <CreditCard className="w-3 h-3" /> Crédito {client.diasCredito}D
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 w-fit">Contado</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); openClientModal(client); }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FileEdit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredClients.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
                        No se encontraron clientes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 text-[10px] uppercase font-bold text-gray-500 tracking-wider sticky top-0 backdrop-blur-sm z-10">
                  <tr>
                    <th className="px-6 py-4 border-b border-gray-100">Razón Social</th>
                    <th className="px-6 py-4 border-b border-gray-100">Contacto</th>
                    <th className="px-6 py-4 border-b border-gray-100">Ubicación</th>
                    <th className="px-6 py-4 border-b border-gray-100 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {filteredProviders.map(provider => (
                    <tr key={provider.id} className="hover:bg-[#F8FAFC] transition-colors group cursor-pointer" onClick={() => openProviderModal(provider)}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#0B1120]">{provider.razonSocial}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{provider.rif}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{provider.telefono || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-xs font-medium line-clamp-1">{provider.direccion || 'No especificada'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); openProviderModal(provider); }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FileEdit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProviders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">
                        No se encontraron proveedores.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Client Modal */}
      {isModalOpen && editingClient && (
        <div className="fixed inset-0 bg-[#0B1120]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-black text-[#0B1120] font-montserrat tracking-tight">
                {editingClient.razonSocial ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">RIF / Cédula</label>
                  <div className="flex">
                    <select
                      value={editingClient.tipoCliente || 'V'}
                      onChange={e => setEditingClient({...editingClient, tipoCliente: e.target.value})}
                      className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-l-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all border-r-0 font-bold"
                    >
                      <option value="V">V</option>
                      <option value="J">J</option>
                      <option value="E">E</option>
                      <option value="G">G</option>
                      <option value="P">P</option>
                      <option value="C">C</option>
                    </select>
                    <input
                      type="text"
                      value={editingClient.rif}
                      onChange={e => setEditingClient({...editingClient, rif: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-mono uppercase"
                      placeholder="12345678"
                    />
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Razón Social</label>
                  <input
                    type="text"
                    value={editingClient.razonSocial}
                    onChange={e => setEditingClient({...editingClient, razonSocial: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all uppercase"
                    placeholder="NOMBRE O EMPRESA"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Dirección</label>
                  <input
                    type="text"
                    value={editingClient.direccion}
                    onChange={e => setEditingClient({...editingClient, direccion: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all uppercase"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Teléfono</label>
                  <input
                    type="text"
                    value={editingClient.telefono}
                    onChange={e => setEditingClient({...editingClient, telefono: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  />
                </div>
                
                <div className="col-span-2 border-t border-gray-100 pt-5 mt-2">
                  <h3 className="text-sm font-black text-[#0B1120] mb-4">Condiciones Comerciales</h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Tipo de Precio</label>
                      <select
                        value={editingClient.tipoPrecio}
                        onChange={e => setEditingClient({...editingClient, tipoPrecio: e.target.value as any})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                      >
                        <option value="Minorista">Minorista</option>
                        <option value="Mayorista">Mayorista</option>
                      </select>
                    </div>
                    
                    <div className="col-span-2 sm:col-span-1 flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={editingClient.credito}
                          onChange={e => setEditingClient({...editingClient, credito: e.target.checked})}
                          className="w-5 h-5 text-[#2563EB] border-gray-300 rounded focus:ring-[#2563EB] transition-all"
                        />
                        <span className="text-sm font-bold text-gray-700 group-hover:text-[#0B1120]">Aplica Crédito</span>
                      </label>
                      
                      {editingClient.credito && (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="number"
                            value={editingClient.diasCredito}
                            onChange={e => setEditingClient({...editingClient, diasCredito: Number(e.target.value)})}
                            className="w-20 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                            min="0"
                          />
                          <span className="text-xs font-bold text-gray-500">DÍAS</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveClient}
                className="bg-[#2563EB] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20 font-montserrat uppercase tracking-wider"
              >
                Guardar Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provider Modal */}
      {isProviderModalOpen && editingProvider && (
        <div className="fixed inset-0 bg-[#0B1120]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-black text-[#0B1120] font-montserrat tracking-tight">
                {editingProvider.razonSocial ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h2>
              <button onClick={() => setIsProviderModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Tipo y RIF/Cédula</label>
                  <div className="flex gap-2">
                    <select
                      value={editingProvider.tipoProveedor || 'J'}
                      onChange={e => setEditingProvider({...editingProvider, tipoProveedor: e.target.value as any})}
                      className="w-20 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    >
                      <option value="V">V</option>
                      <option value="J">J</option>
                      <option value="E">E</option>
                      <option value="G">G</option>
                    </select>
                    <input
                      type="text"
                      value={editingProvider.rif}
                      onChange={e => setEditingProvider({...editingProvider, rif: e.target.value})}
                      className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-mono uppercase"
                      placeholder="123456789"
                    />
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Razón Social / Nombre</label>
                  <input
                    type="text"
                    value={editingProvider.razonSocial}
                    onChange={e => setEditingProvider({...editingProvider, razonSocial: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all uppercase"
                    placeholder="NOMBRE O EMPRESA"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Dirección</label>
                  <input
                    type="text"
                    value={editingProvider.direccion}
                    onChange={e => setEditingProvider({...editingProvider, direccion: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all uppercase"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Teléfono</label>
                  <input
                    type="text"
                    value={editingProvider.telefono}
                    onChange={e => setEditingProvider({...editingProvider, telefono: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Correo Electrónico</label>
                  <input
                    type="email"
                    value={editingProvider.email || ''}
                    onChange={e => setEditingProvider({...editingProvider, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                    placeholder="ejemplo@correo.com"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Condición de Pago</label>
                  <div className="flex items-center gap-4 h-[42px]">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingProvider.credito || false}
                        onChange={e => setEditingProvider({...editingProvider, credito: e.target.checked, diasCredito: e.target.checked ? (editingProvider.diasCredito || 15) : 0})}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      Permite Crédito
                    </label>
                    {editingProvider.credito && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editingProvider.diasCredito || ''}
                          onChange={e => setEditingProvider({...editingProvider, diasCredito: parseInt(e.target.value) || 0})}
                          className="w-20 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                          placeholder="Días"
                        />
                        <span className="text-xs text-gray-500 font-bold">Días</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsProviderModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveProvider}
                className="bg-[#2563EB] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20 font-montserrat uppercase tracking-wider"
              >
                Guardar Proveedor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
