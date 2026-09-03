import { Layers } from 'lucide-react';

export default function SimplePage({ title }: { title: string }) {
  return (
    <div className="h-full flex flex-col bg-transparent relative">
      <div className="px-8 py-6 flex flex-wrap items-center justify-between shrink-0 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#2563EB] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#0B1120] font-montserrat tracking-tight">{title}</h2>
            <p className="text-[12px] text-gray-500 font-medium mt-0.5">Gestión de módulo</p>
          </div>
        </div>
      </div>
      <div className="px-8 pb-6 flex flex-col gap-4 flex-1 overflow-hidden">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="w-10 h-10 text-[#2563EB]" />
            </div>
            <h3 className="text-xl font-black text-[#0B1120] mb-2 font-montserrat tracking-tight">Módulo en Construcción</h3>
            <p className="text-sm text-gray-500">El módulo de {title} estará disponible próximamente en futuras actualizaciones.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
