import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface BibleReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  reference: string; // e.g., "Juan 3:16"
}

export const BibleReaderModal: React.FC<BibleReaderModalProps> = ({ isOpen, onClose, reference }) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<{ chapter: number; book: string; verses: any[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && reference) {
      fetchVerse();
    }
  }, [isOpen, reference]);

  const fetchVerse = async () => {
    setLoading(true);
    setError(null);
    try {
      // Clean reference for the API
      // The API https://bible-api.deno.dev is quite smart but needs proper splitting
      const parts = reference.match(/((?:[1-3]\s+)?[A-ZÁÉÍÓÚ][a-zâ-ûáéíóúñ]+\.?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?/i);
      
      if (!parts) throw new Error("Referencia inválida");

      const book = parts[1].trim();
      const chapter = parts[2];
      const verse = parts[3];
      const toVerse = parts[4];

      let url = `https://bible-api.deno.dev/api/read/rv1960/${book}/${chapter}`;
      if (verse) {
        url += (toVerse ? `/${verse}-${toVerse}` : `/${verse}`);
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("No se pudo obtener el pasaje");
      
      const data = await res.json();
      setContent(data);
    } catch (e) {
      console.error(e);
      setError("No pudimos encontrar ese pasaje. Asegúrate de que la referencia sea correcta.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white dark:bg-brand-obsidian rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-white/10">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-brand-surface">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">Palabra de Gracia</span>
            <h2 className="text-2xl font-serif font-black dark:text-white leading-tight">{reference}</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 font-serif">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Buscando en las Escrituras...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-red-500/20 mb-4">menu_book</span>
              <p className="text-gray-500 dark:text-gray-400 font-medium">{error}</p>
            </div>
          ) : content ? (
            <div className="space-y-6 text-xl md:text-2xl text-gray-700 dark:text-gray-200 leading-relaxed text-justify">
              <div className="relative">
                <span className="text-6xl absolute -top-10 -left-6 opacity-5 font-serif text-brand-primary select-none">“</span>
                {Array.isArray(content) ? content.map((v: any) => (
                   <span key={v.number} className="inline mr-2">
                     <sup className="text-xs font-bold text-brand-primary mr-1">{v.number}</sup>
                     {v.verse}
                   </span>
                )) : (
                  <p>
                    <sup className="text-xs font-bold text-brand-primary mr-1">{content.chapter}</sup>
                    {/* Handle simple verse response if any */}
                    {(content as any).verse || "Contenido no disponible"}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Reina-Valera 1960</span>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-brand-obsidian dark:bg-brand-primary text-white dark:text-brand-obsidian rounded-full font-bold text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
