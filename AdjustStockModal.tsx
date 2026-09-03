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