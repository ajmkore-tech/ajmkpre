import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Combobox({ value, onChange, options, required, className }: { value: string; onChange: (val: string) => void; options: string[]; required?: boolean; className?: string; }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!value) return options.slice(0, 100);
    return options.filter(o => o && o.toLowerCase().includes(value.toLowerCase())).slice(0, 100);
  }, [options, value]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative flex items-center">
        <input 
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          required={required}
          className={className}
        />
        <div 
          className="absolute right-1.5 cursor-pointer p-1 text-gray-400 hover:text-gray-600 bg-transparent"
          onMouseDown={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, i) => (
              <div 
                key={i} 
                className="px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 text-[#0F172A] border-b border-gray-50 last:border-0"
                onClick={() => { onChange(opt); setIsOpen(false); }}
              >
                {opt}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-gray-500 italic bg-gray-50">Usar valor: "{value}"</div>
          )}
        </div>
      )}


    </div>
  );
}

