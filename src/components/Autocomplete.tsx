import React, { useState, useRef, useEffect, useMemo } from 'react';

export default function Autocomplete({ value, onChange, options, onSelect, placeholder, className }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!search) return options.slice(0, 50);
    const s = search.toLowerCase();
    return options.filter((o: any) => 
      o.label.toLowerCase().includes(s) || (o.subLabel && o.subLabel.toLowerCase().includes(s))
    ).slice(0, 50);
  }, [options, search]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input 
        type="text"
        value={search}
        onChange={(e) => { setSearch(e.target.value); onChange(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        className={className}
        placeholder={placeholder}
      />
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt: any, i: number) => (
              <div 
                key={i} 
                className="px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 text-[#0F172A] border-b border-gray-50 last:border-0"
                onClick={() => { 
                  setSearch(opt.label); 
                  onChange(opt.label); 
                  if(onSelect) onSelect(opt.data); 
                  setIsOpen(false); 
                }}
              >
                <div className="font-bold">{opt.label}</div>
                {opt.subLabel && <div className="text-[10px] text-gray-500">{opt.subLabel}</div>}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-gray-500 italic bg-gray-50">No hay coincidencias</div>
          )}
        </div>
      )}


    </div>
  );
}


