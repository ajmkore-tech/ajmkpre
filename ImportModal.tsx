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